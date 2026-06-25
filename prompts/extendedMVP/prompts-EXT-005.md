## Prompt 1: Plan Ticket EXT-001 implementation
~~~text
/plan
As the Full-Stack Engineer on the RealSaveFooding project, 
I want to setup Speckit to start using an SDD framework from now on.
Tasks:
1. Complete the setup in the project.
2. Based on the project context, create the constitution.md required. Prompt me to validate.
3. Guide me to start to start using it with docs/tickets/extendedMVP/EXT-005-recipe-suggestions.md
~~~

## Prompt 2: Specify
/speckit-specify docs/tickets/extendedMVP/EXT-005-recipe-suggestions.md

## Prompt 3: Plan
/speckit-plan


## Prompt 4: Tasks
/speckit-tasks

## Prompt 5: Agent Context Update
/speckit-implement (with tasks.md as context)

## Prompt 6: Fix after manual review
After a manual review and test, when I try to see the details from a recipe the page doesn't load. i.e. http://localhost:8080/recipes/52959 do not display anything but the list of recipes

## Prompt 7: Improve UX
The ingredientes in the recipe list is hard to see, I can't even read well properly.
Change the text colour or the background i.e. "Salmón" from the image (Added an image as context).

## Prompt 8: Converge + Implement
/speckit-converge
/speckit-implement