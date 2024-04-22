# Admin Panel STATES and ACTIONS

- initial: 
    - empty default timeline loaded [timelineState]
    - empty default fact loaded [factState]
    - no update needed [refresh]
    - no changes to save [hasUnsavedChanges()]
    - timeline chooser prompts to create new
    - no form shown until create new button pressed?

- timeline selected:
    - update needed: new timeline loaded and form fields populated [
      timelineState ]
	- set initial timeline for comparison [initialTimeline]
	- empty default fact loaded [factState]
	- no changes to save [hasUnsavedChanges()]
	- timeline chooser resets [updateTimelineList]
 
- data entered into metadata form:
	- update current timeline [timelineState]
    - compare with initial timeline: set "changes needed" [initialTimeline,
      hasUnsavedChanges]
 
- fact JSON upload selected
	- parse input data and update timeline facts [timelineState]
 
- fact data entered in new fact form:
	- update current fact preview [factState]
 
 
- new fact added
	- update & display timeline facts [timelineState]
    - compare to initial timeline; check if new "changes needed"
      [timelineState, initialTimeline, changesNeeded]
 
- existing fact edited 
	- populate new fact form with selected fact data [factState]
	- delete fact from current timeline [timelineState]
 
- existing fact deleted
	- remove from timeline and update display [timelineState]
    - compare to initial timeline; check if new "changes needed"
      [timelineState, initialTimeline, changesNeeded]

- save button clicked
	- update timeline with current data [timelineState]
    - send create/update request to backend server and check response
      [saveReady]
	- (reset timeline to version on server [timelineState])
	- mark "no changes needed" [changesNeeded]
 
- disregard changes button clicked
    - confirm; if existing, reset timeline to version on server; else just
      reset to default timeline [timelineState] [[+ refresh? ]]
	- mark "no changes needed" [changesNeeded]
- 
-  delete timeline button clicked
         - confirm; send delete request to server [itemToDelete]
         - reset timeline to defaults [timelineState] [[+ refresh? ]]



