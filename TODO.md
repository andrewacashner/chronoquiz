# TO DO

## Bugs

## Security
- sanitize user input
    - now we are storing actual image and info elements in the Card after
      sanitization (=good?)
- better error handling

## Performance
- create timeline immediately when input is selected
    - load all images up front
    - send a message when it is ready that will be read by play button
      callback function

## Style
- hide elements by adding or removing class in class list (not just by setting
  class)

## Expansions
- add audio/video to cards?
    - how could users add media by path??
- hide @data-when on clues

## User interface
- error sound

## Layout
- timeline rule should always extend to full width as it expands
    - replace current hacky CSS solution with two overlapping rules

## Drag/drop
- Shift cards left on hover also?

## Project

- Add, fill in timelines
- Put online
