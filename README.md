#CBadge

GitHub badges for CMake/CTest/CDash projects.


##Usage

CBadge generates three badges for GitHub projects that post dashboards to `http://open.cdash.org/`: 
  * A build badge at `http://cbadge-instance/CDashProjectName/build`, like ![Build Status](http://img.shields.io/badge/build-passing-brightgreen.svg).
  * A test badge at `http://cbadge-instance/CDashProjectName/test`, like ![Testing Status](http://img.shields.io/badge/tests-failing-red.svg).
  * A coverage badge at `http://cbadge-instance/CDashProjectName/coverage`, like ![Coverage Status](http://img.shields.io/badge/coverage-60%-yellow.svg).

To add badges to your README.md for you GitHub repository, include them with the following syntax:

```
![Build Status](http://cbadge-instance/CDashProjectName/build)
![Test Status](http://cbadge-instance/CDashProjectName/test)
![Coverage Status](http://cbadge-instance/CDashProjectName/coverage)
```

Just replace `CDashProjectName` with your project, like `VTK`, `Insight`, `CMake`, `Remus`, etc.
