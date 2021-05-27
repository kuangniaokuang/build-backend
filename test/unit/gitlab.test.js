const assert = require('assert');
const sinon = require('sinon')
const chai = require('chai')
const {
  expect
} = chai

const gitlab = require('../../api/util/gitlab')
const { getApiUrlFromWebUrl, formatGitUrl } = require('../../api/util/gitlab')

describe('Gitlab', () => {
  let project; let external_project; let user

  beforeEach(() => {
    project = {
      name: 'Test Repo Merico',
      gitUrl: 'https://gitlab.com/joncodo-merico/test-repo-merico.git'
    }
    external_project = {
      name: 'Antora',
      gitUrl: 'https://gitlab.com/antora/antora.git',
      external: true,
      expected: {
        encodedSlug: 'antora%2Fantora'
      }
    }
    invalid_project_owner = {
      name: 'Bad Project Owner',
      gitUrl: 'https://gitlab.com/a/projectname.git',
      expected: {
        encodedSlug: undefined,
        error: 'Cannot find repo owner in gitUrl'
      }
    },
    non_gitlab_project = {
      name: 'NON_GITLAB Project',
      gitUrl: 'https://github.net/aaaa/bbbb.git',
      expected: {
        encodedSlug: undefined,
        error: 'This is not a Gitlab.com Repo URL'
      }
    },
    bad_slug_project = {
      name: 'git_extension_missing',
      gitUrl: 'https://gitlab.com/jchinapen-m/git_extension_missing',
      expected: {
        encodedSlug: undefined,
        error: 'This Git URL is missing the .git extension'
      }
    },
    user = {
      gitlabUsername: 'joncodo-merico'
    }
  })

  afterEach(()=>{
    sinon.restore()
  })

  describe('getApiUrlFromWebUrl', () => {
    it ('formats the git url into the api url', () => {
      let url = "https://gitlab.com/graphviz/graphviz"
      assert.strictEqual(getApiUrlFromWebUrl(url), 'https://gitlab.com/api/v4/projects/graphviz%2Fgraphviz')

      url = "git://gitlab.com/graphviz/graphviz.git"
      assert.strictEqual(getApiUrlFromWebUrl(url), 'https://gitlab.com/api/v4/projects/graphviz%2Fgraphviz')

      url = "https://gitlab.com/joncodo-merico/Test-repo-merico"
      assert.strictEqual(getApiUrlFromWebUrl(url), 'https://gitlab.com/api/v4/projects/joncodo-merico%2FTest-repo-merico')

      url = "git@gitlab.com:joncodo-merico/Test-repo-merico"
      assert.strictEqual(getApiUrlFromWebUrl(url), 'https://gitlab.com/api/v4/projects/joncodo-merico%2FTest-repo-merico')
    })
  })
})
