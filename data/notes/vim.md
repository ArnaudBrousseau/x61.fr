Here are some nice tips and tricks I learned while practising VIM at work or at
home. Some of these commands are life saviors. Enjoy!

Setting VIM's syntax highlighter to a particular language
---------------------------------------------------------
The answer is a single command: setf

    setf markdown
    setf javascript
    etc

Look up docs about a function, a command, anything
--------------------------------------------------
When your cursor is on a word, press maj+K.

Delete efficiently
------------------
`dtx` => deletes until, NOT including a character. (useful to say delete until the next parens for instance: `dt)`)
`ctx` => go to insert mode

Ctags
-----
ctags: ctrl+] to go, ctrl+T to go back. You don't need anything else
