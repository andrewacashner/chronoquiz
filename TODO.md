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
- Improve error handling
- Routing: add About page

- Remove unused code
- Class methods: mutate or return copy?
- (DONE) FactList is a leaky abstraction: Make sure never need to reference items
  member outside of class

- Allow HTML in info field or Markdown for italics at least
# CSS

- Replace hacky timeline bar display

# Bugs

- Margin doesn't reset after wrong guess
- "Play again" button doesn't work
- Date comparison is wrong for cards with current year, because they
  include exact time if created after Now card?

## Next stage

- Add login, account interface
