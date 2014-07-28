#CBadge

GitHub badges for CMake/CTest/CDash projects.


##Usage

###Badges

CBadge generates four badges for GitHub projects that post dashboards to `http://open.cdash.org/`:
  * A configure badge at `http://cbadge-instance/:CDashProjectName/configure/:GitCommitSHA`, like ![Configure Status](http://img.shields.io/badge/configure-passing-brightgreen.svg).
  * A build badge at `http://cbadge-instance/:CDashProjectName/configure/:GitCommitSHA`, like ![Configure Status](http://img.shields.io/badge/build-passing-brightgreen.svg).
  * A test badge at `http://cbadge-instance/:CDashProjectName/test/:GitCommitSHA`, like ![Testing Status](http://img.shields.io/badge/tests-failing-red.svg).
  * A coverage badge at `http://cbadge-instance/:CDashProjectName/coverage/:GitCommitSHA`, like ![Coverage Status](http://img.shields.io/badge/coverage-60%-yellow.svg).
  * Additionally, you can send CBadge the name of a tag or branch to have it automatically redirect you to the correct SHA by using `http://cbadge-instance/:CDashProjectName/:task/:GitHubRepoOwner/:GitHubRepoName/:tag`.

To add badges to your README.md for you GitHub repository, include them with the following syntax:

```
![Configure Status](http://cbadge-instance/:CDashProjectName/configure/:GitHubRepoOwner/:GitHubRepoName/master)
![Build Status](http://cbadge-instance/:CDashProjectName/build/:GitHubRepoOwner/:GitHubRepoName/master)
![Test Status](http://cbadge-instance/:CDashProjectName/test/:GitHubRepoOwner/:GitHubRepoName/:tag)
![Coverage Status](http://cbadge-instance/:CDashProjectName/coverage/:GitHubRepoOwner/:GitHubRepoName/:tag)
```

All badges are served with proper headers to ensure that GitHub doesn't cache them.

###As a CI Summary Tool

CBadge can comment on pull requests to inform you of the new builds' status.  At the end of a build that submits to the dashboard, simply issue a GET request to `http://cbadge-instance/:CDashProjectName/pullRequest/:GitHubRepoOwner/:GitHubRepoName/:PullRequestNumber/:GitCommitSHA`.  For a Travis-CI build, one could add `http://cbadges.com/:CDashProjectName/GitHubRepoOwner/:GitHubRepoName/${TRAVIS_PULL_REQUEST}/${TRAVIS_COMMIT}.

Example summary:

| Base (9ceac20) | Merged (e3b1423)|
|:---:|:---:|
|[![Base Coverage Status](http://cbadge.com/Remus/coverage/9ceac202d5c6f07b7e00f4ec50c89d19b706f30c)](http://open.cdash.org/index.php?project=Remus)|[![Merge Coverage Status](http://cbadge.com/Remus/coverage/e3b14231efa176335fbf684eee9684a98a7d7433)](http://open.cdash.org/index.php?project=Remus)
|[![Base Testing Status](http://cbadge.com/Remus/test/9ceac202d5c6f07b7e00f4ec50c89d19b706f30c)](http://open.cdash.org/index.php?project=Remus)|[![Merge Testing Status](http://cbadge.com/Remus/test/e3b14231efa176335fbf684eee9684a98a7d7433)](http://open.cdash.org/index.php?project=Remus)
|[![Base Build Status](http://cbadge.com/Remus/build/9ceac202d5c6f07b7e00f4ec50c89d19b706f30c)](http://open.cdash.org/index.php?project=Remus)|[![Merge Build Status](http://cbadge.com/Remus/build/e3b14231efa176335fbf684eee9684a98a7d7433)](http://open.cdash.org/index.php?project=Remus)
|[![Base Configure Status](http://cbadge.com/Remus/configure/9ceac202d5c6f07b7e00f4ec50c89d19b706f30c)](http://open.cdash.org/index.php?project=Remus)|[![Merge Configure Status](http://cbadge.com/Remus/configure/e3b14231efa176335fbf684eee9684a98a7d7433)](http://open.cdash.org/index.php?project=Remus)