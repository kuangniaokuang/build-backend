let assert = require('assert');
const chai = require('chai')
const { expect } = chai

const { filterGitProjectsBySize, homogenizeGitUrl, homogenizeWebUrl, mergeProjectArrays } = require('../../api/util/project');

describe('gitProject', () => {
  describe('filterGitProjectsBySize', () => {
    let gitProjects = []
    requestProjects = []

    beforeEach(() => {
      gitProjects = [{
          size: 10000,
        },
        {
          noSize: true, // to make clear there is no size property here
        },
        {
          size: 0,
        },
        {
          size: 200000000000,
        },
        {
          size: 0,
        },
        null
      ]

      requestProjects = [{
          name: 'first',
        },
        {
          name: 'second',
        },
        {
          name: 'third',
        },
        {
          name: 'fourth',
        },
        {
          name: 'fifth',
        },
        {
          name: 'sixth',
        }
      ]
    })

    it('filters errors into failures', () => {
      const {
        failures
      } = filterGitProjectsBySize(gitProjects, requestProjects)

      assert.strictEqual(1, failures.length)
      assert.strictEqual(requestProjects[5].name, failures[0].project.name)
    })

    it('filters large projects into warnings and successes', () => {
      const {
        validProjects,
        warnings
      } = filterGitProjectsBySize(gitProjects, requestProjects)

      assert.strictEqual(1, warnings.length)
      assert.strictEqual(requestProjects[3].name, warnings[0].project.name)

      assert.strictEqual(5, validProjects.length)
      assert.strictEqual(requestProjects[3].name, validProjects[3].name)
    })
  })

  describe ('homogenizeGitUrl', () => {
    describe('github', () => {
      it ('turns github https into git', () => {
        const gitUrl = 'https://github.com/repoOwner/repo-name.git'
        expect(homogenizeGitUrl(gitUrl)).to.equal('git://github.com/repoOwner/repo-name.git')
      })

      it ('turns github http into git', () => {
        const gitUrl = 'http://github.com/repoOwner/repo-name.git'
        expect(homogenizeGitUrl(gitUrl)).to.equal('git://github.com/repoOwner/repo-name.git')
      })

      it ('leaves github git urls alone', () => {
        const gitUrl = 'git://github.com/repoOwner/repo-name.git'
        expect(homogenizeGitUrl(gitUrl)).to.equal('git://github.com/repoOwner/repo-name.git')
      })

      it ('converts an ssh url', () => {
        const gitUrl = 'git@github.com:repoOwner/repo-name.git'
        expect(homogenizeGitUrl(gitUrl)).to.equal('git://github.com/repoOwner/repo-name.git')
      })

      it ('can handle OR setter', () => {
        const req = {
          query: {
            URL: 'http://github.com/repoOwner/repo-name.git'
          }
        }

        expect(homogenizeGitUrl(req.query.gitUrl || req.query.URL)).to.equal('git://github.com/repoOwner/repo-name.git')

        req.query.URL = null
        req.query.gitUrl = 'http://github.com/repoOwner/repo-name.git'

        expect(homogenizeGitUrl(req.query.gitUrl || req.query.URL)).to.equal('git://github.com/repoOwner/repo-name.git')
      })
    })

    describe('gitlab', () => {
      it ('turns gitlab git urls into https', () => {
        const gitUrl = 'git://gitlab.com/repoOwner/repo-name.git'
        expect(homogenizeGitUrl(gitUrl)).to.equal('https://gitlab.com/repoOwner/repo-name.git')
      })

      it ('turns gitlab http urls into https', () => {
        const gitUrl = 'http://gitlab.com/repoOwner/repo-name.git'
        expect(homogenizeGitUrl(gitUrl)).to.equal('https://gitlab.com/repoOwner/repo-name.git')
      })

      it ('leaves gitlab https urls alone', () => {
        const gitUrl = 'https://gitlab.com/repoOwner/repo-name.git'
        expect(homogenizeGitUrl(gitUrl)).to.equal('https://gitlab.com/repoOwner/repo-name.git')
      })

      it ('converts an ssh url', () => {
        const gitUrl = 'git@gitlab.com:repoOwner/repo-name.git'
        expect(homogenizeGitUrl(gitUrl)).to.equal('https://gitlab.com/repoOwner/repo-name.git')
      })
    })
  })

  describe ('homogenizeWebUrl', () => {
    describe('bad urls', () => {
      it ('removes the \/ and the api.github.com', () => {
        const gitUrl = "https:\/\/api.github.com\/repos\/volley-labs\/ssis-hosting-docs"
        expect(homogenizeWebUrl(gitUrl)).to.equal('https://github.com/volley-labs/ssis-hosting-docs')
      })

      it ('removes the \/ and the api.github.com', () => {
        const gitUrl = "https://api.github.com/repos/ce/ce-frontend"
        expect(homogenizeWebUrl(gitUrl)).to.equal('https://github.com/ce/ce-frontend')
      })
    })

    describe('github', () => {
      it ('removes the .git', () => {
        const gitUrl = 'https://github.com/repoOwner/repo-name.git'
        expect(homogenizeWebUrl(gitUrl)).to.equal('https://github.com/repoOwner/repo-name')
      })

      it ('converts git urls to web urls', () => {
        const gitUrl = 'git://github.com/repoOwner/repo-name.git'
        expect(homogenizeWebUrl(gitUrl)).to.equal('https://github.com/repoOwner/repo-name')
      })

      it ('converts an ssh url', () => {
        const gitUrl = 'git@github.com:repoOwner/repo-name.git'
        expect(homogenizeWebUrl(gitUrl)).to.equal('https://github.com/repoOwner/repo-name')
      })
    })

    describe('gitlab', () => {
      it ('removes the .git', () => {
        const gitUrl = 'git://gitlab.com/repoOwner/repo-name.git'
        expect(homogenizeWebUrl(gitUrl)).to.equal('https://gitlab.com/repoOwner/repo-name')
      })

      it ('converts git urls to web urls', () => {
        const gitUrl = 'https://gitlab.com/repoOwner/repo-name.git'
        expect(homogenizeWebUrl(gitUrl)).to.equal('https://gitlab.com/repoOwner/repo-name')
      })

      it ('converts an ssh url', () => {
        const gitUrl = 'git@gitlab.com:repoOwner/repo-name.git'
        expect(homogenizeWebUrl(gitUrl)).to.equal('https://gitlab.com/repoOwner/repo-name')
      })
    })
  })

  describe('mergeProjectArrays', () => {
    it('should take many arrays or projects with different oject properties and combine them', () => {
      let arrays = [
        [{
            gitUrl: 'foo',
            a: 1
          },
          {
            gitUrl: 'baz',
            d: 1
          }
        ],
        [{
          gitUrl: 'foo',
          b: 1
        }],
        [{
          gitUrl: 'bar',
          c: 1
        }]
      ]
      let expected = [{
          gitUrl: 'foo',
          a: 1,
          b: 1
        }, {
          gitUrl: 'baz',
          d: 1
        },
        {
          gitUrl: 'bar',
          c: 1
        }
      ]
      let finalArray = mergeProjectArrays(arrays)
      assert.deepStrictEqual(finalArray, expected)
    });
  });

  describe ('homogenizeGitUrl', () => {
    describe('github', () => {
      it ('turns github https into git', () => {
        const gitUrl = 'https://github.com/repoOwner/repo-name.git'
        expect(homogenizeGitUrl(gitUrl)).to.equal('git://github.com/repoOwner/repo-name.git')
      })

      it ('turns github http into git', () => {
        const gitUrl = 'http://github.com/repoOwner/repo-name.git'
        expect(homogenizeGitUrl(gitUrl)).to.equal('git://github.com/repoOwner/repo-name.git')
      })

      it ('leaves github git urls alone', () => {
        const gitUrl = 'git://github.com/repoOwner/repo-name.git'
        expect(homogenizeGitUrl(gitUrl)).to.equal('git://github.com/repoOwner/repo-name.git')
      })

      it ('converts an ssh url', () => {
        const gitUrl = 'git@github.com:repoOwner/repo-name.git'
        expect(homogenizeGitUrl(gitUrl)).to.equal('git://github.com/repoOwner/repo-name.git')
      })
    })

    describe('gitlab', () => {
      it ('turns gitlab git urls into https', () => {
        const gitUrl = 'git://gitlab.com/repoOwner/repo-name.git'
        expect(homogenizeGitUrl(gitUrl)).to.equal('https://gitlab.com/repoOwner/repo-name.git')
      })

      it ('turns gitlab http urls into https', () => {
        const gitUrl = 'http://gitlab.com/repoOwner/repo-name.git'
        expect(homogenizeGitUrl(gitUrl)).to.equal('https://gitlab.com/repoOwner/repo-name.git')
      })

      it ('leaves gitlab https urls alone', () => {
        const gitUrl = 'https://gitlab.com/repoOwner/repo-name.git'
        expect(homogenizeGitUrl(gitUrl)).to.equal('https://gitlab.com/repoOwner/repo-name.git')
      })

      it ('converts an ssh url', () => {
        const gitUrl = 'git@gitlab.com:repoOwner/repo-name.git'
        expect(homogenizeGitUrl(gitUrl)).to.equal('https://gitlab.com/repoOwner/repo-name.git')
      })
    })
  })
})
