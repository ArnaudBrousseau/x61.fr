What's in my mind
-----------------

I walk in San Francisco a lot. But when it comes to hills, I'd like to avoid them when possible, even though you usually have a great view when you're on top of it.

What did I use?
---------------

Now, I used Google Fusion API to create the lat/long => elevation table, and Google Maps to display that.
The data source I used was the [USGS dataset](http://gisdata.usgs.net/xmlwebservices2/elevation_service.asmx?op=getElevation "USGS Elevation service").

Constraints
-----------

Google Maps has constraints over...pretty much everything. Actually, when you use Table Fusion and maps, you can't read more than 100,000 rows per request. In my case, since I'd like a rather sharp resolution for my elevation maps, I had to get close to that limit.

More specifically, I was willing to get a map covering the whole city. It has roughly 100 blocks east from west...and if we take only 3 points per block, we have already 300 points. North/South is pretty much the same. That leaves us with 300*300 = 90,000 points. Not that bad.

Now, how do I split those points? My guess is that they must be evenly distributed across the map (even though we could have more scarce points in "flat" areas and higher resolution in hills, but that's maybe for later)


    37.811038,-122.477778 <= Northernmost point, Golden Gate Bridge
    37.778669,-122.514428 <= Easternmost point, Cliff House near Ocean Beach
    37.704739,-122.442899 <= Southernmost point, before San Bruno mountain park begins
    37.728731,-122.357017 <= Westernmost point, at Hunters point

Now that we have those limits, we can easily determine which datapoints we need (I used a basic Python shell): 

    from __future__ import division
    
    =====================
    
    >>> max_lat = 37.811038
    >>> min_lat = 37.704739
    >>> min_lng = -122.514428
    >>> max_lng = -122.357017
    
    =====================
    
    >>> lat_step = (max_lat - min_lat) / 300
    0.0003543300000000234
    >>> lng_step = (max_lng - min_lng) / 300
    0.0005247033333333206
    
    =====================
    
    >>> lat_list = [min_lat + i*lat_step for i in range(301)]
    >>> lng_list = [min_lng + i*lng_step for i in range(301)]
    >>> lat_lng_pts = [(lat,lng) for lat in lat_list for lng in lng_list]
    
    >>> len(lat_lng_pts)
    90601

Okay, now, we have the data points. Next step, retrieve the altitude for every points we got. That's where the USGS dataset comes in handy.

The USGS API supports simple GETs. For instance: 
    
    GET /xmlwebservices2/elevation_service.asmx/getElevation?X_Value=lng&Y_Value=lat&Elevation_Units=METERS&Source_Layer=NED.CONUS_NED_13W&Elevation_Only=TRUE HTTP/1.1
    Host: gisdata.usgs.net
    
    HTTP/1.1 200 OK
    Content-Type: text/xml; charset=utf-8
    Content-Length: length

    <?xml version="1.0"?>
    <double>56.2435</double>

Now, "METERS" could be "FEET", but I prefer metric system, so here you go. 
The weird "NED.CONUS_NED_13W" param corresponds to the Western part of the US (see [this table](http://gisdata.usgs.net/XMLWebServices2/Elevation_Service_Methods.php "USGS Documentation") for more possible params). And the Elevation_only param tells that we care about the elevation only. The response will be a simple number, wrapped in XML.

Now, back to our Python shell: 

    >>> import urllib2, sys
    >>> def scrape(lat_lng_pts, filename):
    >>>   f = open(filename, "a")
    >>>   for (lat, lng) in lat_lng_pts:
    >>>     resp = urllib2.urlopen("http://gisdata.usgs.net/xmlwebservices2/elevation_service.asmx/getElevation?X_Value=" + str(lng) + "&Y_Value=" + str(lat) + "&Elevation_Units=METERS&Source_Layer=NED.CONUS_NED_13W&Elevation_Only=TRUE&Elevation_Only=TRUE")
    >>>     data = resp.read()
    >>>     elevation = data.split("<double>")[-1].split("</double>")[0]
    >>>     f.write(str(lat) + "|" + str(lng) + "|" + elevation + "\n")
    >>>     sys.stdout.write(".")
    >>>   f.close()
    >>> scrape(lat_lng_pts, "elevation-data.csv")
    .
    .
    .
    === Some time passes by...actually, a few hours ===
    .
    .
    .


Google Fusion Layers to the rescue
----------------------------------

Once I created the CSV, I imported it into a brand [new Google Fusion Table](https://www.google.com/fusiontables/DataSource?snapid=S556615xSvg).

A few tricks:

- the longitude and latitude columns are set to "location" type, which enables easier integration with Google Maps further down the road.
- don't be afraid to delete and import the data again. Since Google Fusion Table is kinda new, it can be buggy, especially with large datasets
- I deleted the bad points (various very negative elevations)

What I originally envisioned was a heatmap-like visualization, where the high areas would be red, while the lower ones would be green. It appears that heatmaps are only possible with density data...so...no [Fusion Table Heatmaps](https://developers.google.com/maps/documentation/javascript/layers#FusionTablesHeatmaps) for me. Not this time.

Plan B: use a standard [Fusion Table layer](https://developers.google.com/maps/documentation/javascript/layers#FusionTables), with a custom, semi-transparent overlay to let the map shine through. Easy you say?

 
## Initial deception
[Not quite](http://code.google.com/p/fusion-tables/issues/detail?id=69).

So, it seems I can't have a nice transparent png as my custom marker. In this issue, there's a workaround which involves using the Fusion API directly, but I don't really feel like it.

Even if it eventually works, I do have the following problems with the current graph: 

- The geocoded points aren't aligned with the roads at all, which can be a problem in some cases
- More importantly, the current visualization simply gives an idea of the absolute elevation, which doesn't tell if a street is steep or not.

The result I have so far is [not that bad](http://ar.no.de/labs/sf-hills-baby/first-try.html), but not what I have in mind.

Looks like a perfect time to step back to think again.

## A New Battleplan
I decided to stay within Google environment by leveraging the [Elevation](https://developers.google.com/maps/documentation/javascript/elevation) and [Geocoding](https://developers.google.com/maps/documentation/geocoding/) APIs.
 
The Geocoding API will transform information like "Market and 3rd, San Francisco, CA" into (latitude, longitude) points. The elevation API will then tell the elevation of a certain (lat, lng) point.

This should give me a matrix of (alt, lng, elevation). Other perk of the "cross-street-only" approach: it will reduce the number of points we will work with. We'll have a 100x100 matrix, which gives us approximately 10,000 points to work with, instead of 90,000 before.

Finally, I'll draw lines from one crossing to another using [polylines](https://developers.google.com/maps/documentation/javascript/overlays#Polylines). They will be colored from green to red depending on how steep the current street portion is.

Let's break down the problem into smaller bits: 

1. Get the data about the street crossings in San Francisco. Since there's no such data available directly, we'll manually create a JSON file containing these.
2. Take each crossing, geocode it, and retrieve the altitude.
3. Once we have each crossing's altitude, we have to compute the difference between this crossing and it's closest neighbors.
4. From that difference, generate the polyline with the appropriate color, reflecting the steepness of the path
5. (optional) Simplify the results by combining paths together, i.e., if we have a street with a constant altitude for 5 blocks, we only need 2 points to represent those blocks, not 6, assuming the street is a straight line (mostly true in SF. Streets can turn, but they generally do so when they're steep). I ended up not doing it, because the potential optimization wasn't worth the effort (Google Maps is pretty good at drawing a lot of paths!)

Now that we have this battleplan, let's proceed, step-by-step.

## Gettin' the data
![Geocoder in action](/img/content/street-geocoding.png)

## Compute the paths
Color treatment: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript


## Polishing and final result
Annnnd, success!
Polishing:

- set path clickable to false
- make the html page mobile friendly by adding meta tags, favicons
- optimize the frontend by concatenating all the scripts
- alter the default Google Maps color scheme to make colors more noticeable
- support geolocation
- support appcache

To see the final result, [head to the labs!](/labs/sf-hills)
