Feature Description
Create a Docker hub release flow.

Problem Statement
Currently we are requiring users to download the whole repository and build the docker file from there.

Use Case / User Story
As a user I want to be able to run LensCore without cloning the repository and running makefile. I want to be able to fetch the docker from https://hub.docker.com/. This way I can keep my version up to date without much troubles.

Acceptance Criteria
[] CI releases new version of LensCore on push to main, run npm publish intinya
[] Documentation added about how to use it
[] Documentation added about how to update it
Proposed Solution (Optional)
No response

Priority
Nice to Have - Would be very useful if available

Additional Context
No response
