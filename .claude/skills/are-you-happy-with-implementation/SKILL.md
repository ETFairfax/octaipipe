---
name: are-you-happy-with-implementation
description: Reviews the changes made in the current branch and checks against the frontend-architecture.md file to ensure compliance with already agreed coding conventions and code placement. 
---

## Instructions

Review the changes made in the current branch.  Are you happy with the implemention? Does it conform to the frontend-architecture.md file, coding conventions and other docs? If not, please provide feedback on what needs to be changed.

Beyond what is already in the frontend-architecture.md file, please provide any additional feedback on how to improve the code....

- Are there any signs of bad practice or code smells.  

- Could an implementation be broken into smaller components or functions to improve readability and maintainability?

- Is the code placement correct? If not, provide feedback on where it should be placed.

- Evaluate for performance - can the code be optimized? Are there any potential performance issues?

- Are all comments made relevant to the code it sits on, and not what a caller does? 

- Have we kept the code DRY (Don't Repeat Yourself)? Are there any repeated patterns that could be abstracted into a function or component?

- SOLID principles - are they being followed? If not, provide feedback on how to improve the code to follow these principles.

Be concise and clear in your feedback.

Don't feedback on positive things, only provide feedback on what needs to be changed or improved.