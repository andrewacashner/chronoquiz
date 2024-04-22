# To Do

- (DONE) Add Card input validation in Card class
    - This is async so will require more adjustments to InputForm component
- (DONE) Add new game setup: 
    - (DONE) add "now" card
    - (DONE) shuffle clues
- (DONE) Add colors
- (DONE) Add actual game logic
    - Drag/drop attributes
    - Drag/drop handlers
    - Update timeline width with new cards
    - Game over display
- (DONE) Improve error handling
- (DONE) Routing: add About page

- (DONE) Remove unused code
- (PASS) Class methods: mutate or return copy?
- (DONE) FactList is a leaky abstraction: Make sure never need to reference items
  member outside of class

- Allow HTML in info field or Markdown for italics at least
# CSS

- Replace hacky timeline bar display

# Bugs

- Margin doesn't reset after wrong guess
- (DONE) "Play again" button doesn't work
- Date comparison is wrong for cards with current year, because they
  include exact time if created after Now card?

## Next stage

- (DONE) Add login, account interface

# LIVE TESTING

- When playing, "Play again" button goes to 404 Not found
- Default username on new timeline doesn't get saved

## CSS, IPHONE
- Nav bar display cramped

