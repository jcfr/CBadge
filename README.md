# CBadge

Open source GitHub badges for CMake/CTest/CDash projects.  Fork the repository on [GitHub](http://github.com/brennonbrimhall/CBadge).


## Usage

### Badges

CBadge generates four badges for GitHub projects that post dashboards to `http://open.cdash.org/`:
  * A configure badge at `http://cbadge-instance/:CDashProjectName/:GitCommitSHA/configure.svg`, like ![Configure Status](http://img.shields.io/badge/configure-passing-brightgreen.svg).
  * A build badge at `http://cbadge-instance/:CDashProjectName/:GitCommitSHA/configure.svg`, like ![Configure Status](http://img.shields.io/badge/build-passing-brightgreen.svg).
  * A test badge at `http://cbadge-instance/:CDashProjectName/:GitCommitSHA/test.svg`, like ![Testing Status](http://img.shields.io/badge/tests-10%-red.svg).
  * A coverage badge at `http://cbadge-instance/:CDashProjectName/:GitCommitSHA/coverage.svg`, like ![Coverage Status](http://img.shields.io/badge/coverage-60%-yellow.svg).
  * Additionally, you can send CBadge the name of a tag or branch to have it automatically redirect you to the correct SHA by using `http://cbadge-instance/:CDashProjectName/:task/:GitHubRepoOwner/:GitHubRepoName/:tag`.

To add badges to your README.md for you GitHub repository, include them with the following syntax:

```
![Configure Status](http://cbadge-instance/:CDashProjectName/configure/:GitHubRepoOwner/:GitHubRepoName/:tag)
![Build Status](http://cbadge-instance/:CDashProjectName/build/:GitHubRepoOwner/:GitHubRepoName/:tag)
![Test Status](http://cbadge-instance/:CDashProjectName/test/:GitHubRepoOwner/:GitHubRepoName/:tag)
![Coverage Status](http://cbadge-instance/:CDashProjectName/coverage/:GitHubRepoOwner/:GitHubRepoName/:tag)
```

#### Pretty Tables

Alternatively, to put them in a nice table format like this:

| Master |
| :---: |
|![Configure Status](http://cbadges.com/Remus/configure/robertmaynard/Remus/master)|
|![Build Status](http://cbadges.com/Remus/build/robertmaynard/Remus/master)|
|![Test Status](http://cbadges.com/Remus/test/robertmaynard/Remus/master)|
|![Coverage Status](http://cbadges.com/Remus/coverage/robertmaynard/Remus/master)|

Use this markup:

```
| Master |
| :---: |
|![Configure Status](http://cbadge-instance/:CDashProjectName/configure/:GitHubRepoOwner/:GitHubRepoName/:tag)|
|![Build Status](http://cbadge-instance/:CDashProjectName/build/:GitHubRepoOwner/:GitHubRepoName/:tag)|
|![Test Status](http://cbadge-instance/:CDashProjectName/test/:GitHubRepoOwner/:GitHubRepoName/:tag)|
|![Coverage Status](http://cbadge-instance/:CDashProjectName/coverage/:GitHubRepoOwner/:GitHubRepoName/:tag)|

```

You can easily add columns to the status of other branches or tags, which is useful if you have a workflow that involves a stable master branch and a development branch that gets merged into master.

All badges are served with proper headers to ensure that GitHub doesn't cache them.

### As a CI Summary Tool

CBadge can comment on pull requests to inform you of the new builds' status.  At the end of a build that submits to the dashboard, simply issue a GET request to `http://cbadge-instance/:CDashProjectName/pullRequest/:GitHubRepoOwner/:GitHubRepoName/:PullRequestNumber/:GitCommitSHA`.  For a Travis-CI build, one could add `curl http://cbadges.com/:CDashProjectName/:GitHubRepoOwner/:GitHubRepoName/${TRAVIS_PULL_REQUEST}/${TRAVIS_COMMIT}`.

Example summary:

| Base (9ceac20) | Merged (e3b1423)|
|:---:|:---:|
|[![Base Coverage Status](http://img.shields.io/badge/coverage-81.20%-brightgreen.svg)](http://open.cdash.org/index.php?project=Remus)|[![Merge Coverage Status](http://img.shields.io/badge/coverage-84.40%-brightgreen.svg)](http://open.cdash.org/index.php?project=Remus)
|[![Base Testing Status](http://img.shields.io/badge/test-100.00%-brightgreen.svg)](http://open.cdash.org/index.php?project=Remus)|[![Merge Testing Status](http://img.shields.io/badge/test-100.00%-brightgreen.svg)](http://open.cdash.org/index.php?project=Remus)
|[![Base Build Status](http://img.shields.io/badge/build-1%20errors-red.svg)](http://open.cdash.org/index.php?project=Remus)|[![Merge Build Status](http://img.shields.io/badge/build-2%20warnings-yellow.svg)](http://open.cdash.org/index.php?project=Remus)
|[![Base Configure Status](http://img.shields.io/badge/configure-passing-brightgreen.svg)](http://open.cdash.org/index.php?project=Remus)|[![Merge Configure Status](http://img.shields.io/badge/configure-passing-brightgreen.svg)](http://open.cdash.org/index.php?project=Remus)


## Installation

```
git clone https://github.com/brennonbrimhall/CBadge.git
cd CBadge
cd cbadge
npm install
```

## Updating

```
git pull
cd CBadge
cd cbadge
npm update
```

## Running

```
sudo npm start
```

To run the CI functionality properly, CBadge needs `CBADGE_URL` and `CBADGE_PASSWORD` to be defined.

```
sudo CBADGE_URL="http://cbadge-instance" CBADGE_PASSWORD="qwerty" npm start
```

To run on a different port than 80, just change the port number specified in `/cbadge/bin/www`.  This may let you run CBadge without `sudo`.

