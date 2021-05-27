const {
  v4: uuidv4
} = require('uuid')

let randomNumber = () => {
  return Math.floor(Math.random() * 100000)
}

module.exports = {
  github: {
    repos() {
      return [{
        id: 14364279,
        node_id: 'MDEwOlJlcG9zaXRvcnkxNDM2NDI3OQ==',
        name: 'zshrc',
        full_name: 'joncodo/zshrc',
        private: false,
        owner: {
          login: 'joncodo',
          id: 3011407,
          node_id: 'MDQ6VXNlcjMwMTE0MDc=',
          type: 'User',
          site_admin: false
        },
        html_url: 'https://github.com/joncodo/zshrc',
        description: 'This is my zshrc file',
        fork: false,
        url: 'https://api.github.com/repos/joncodo/zshrc',
        forks_url: 'https://api.github.com/repos/joncodo/zshrc/forks',
        created_at: '2013-11-13T13:09:31Z',
        updated_at: '2014-01-13T23:53:43Z',
        pushed_at: '2014-01-13T23:53:43Z',
        git_url: 'git://github.com/joncodo/zshrc.git',
        ssh_url: 'git@github.com:joncodo/zshrc.git',
        clone_url: 'https://github.com/joncodo/zshrc.git',
        svn_url: 'https://github.com/joncodo/zshrc',
        homepage: null,
        size: 136
      }]
    },
    sharedRepos() {
      return [{
        id: 14364279,
        node_id: 'MDEwOlJlcG9zaXRvcnkxNDM2NDI3OQ==',
        name: 'zshrc',
        full_name: 'bill/foo',
        private: false,
        owner: {
          login: 'bill',
          id: 3011407,
          node_id: 'MDQ6VXNlcjMwMTE0MDc=',
          type: 'User',
          site_admin: false
        },
        html_url: 'https://github.com/bill/foo',
        description: 'This is my zshrc file',
        fork: false,
        url: 'https://api.github.com/repos/bill/foo',
        forks_url: 'https://api.github.com/repos/bill/foo/forks',
        created_at: '2013-11-13T13:09:31Z',
        updated_at: '2014-01-13T23:53:43Z',
        pushed_at: '2014-01-13T23:53:43Z',
        git_url: 'git://github.com/bill/foo.git',
        ssh_url: 'git@github.com:bill/foo.git',
        clone_url: 'https://github.com/bill/foo.git',
        svn_url: 'https://github.com/bill/foo',
        language: 'JavaScript',
        homepage: null,
        size: 136
      }]
    }
  },
  gitlab: {
    repos() {
      return [{
          id: 22230424,
          description: '',
          name: 'EmptyRepo',
          name_with_namespace: 'Jonathan ODonnell / EmptyRepo',
          path: 'emptyrepo',
          path_with_namespace: 'joncodo-merico/emptyrepo',
          created_at: '2020-11-04T13:07:45.706Z',
          default_branch: null,
          tag_list: [],
          ssh_url_to_repo: 'git@gitlab.com:joncodo-merico/emptyrepo.git',
          http_url_to_repo: 'https://gitlab.com/joncodo-merico/emptyrepo.git',
          web_url: 'https://gitlab.com/joncodo-merico/emptyrepo',
          readme_url: null,
          avatar_url: null,
          forks_count: 0,
          star_count: 0,
          last_activity_at: '2020-11-04T13:07:45.706Z',
          namespace: {
            id: 8614859,
            name: 'Jonathan ODonnell',
            path: 'joncodo-merico',
            kind: 'user',
            full_path: 'joncodo-merico',
            parent_id: null,
            avatar_url: '/uploads/-/system/user/avatar/6460561/avatar.png',
            web_url: 'https://gitlab.com/joncodo-merico'
          }
        },
        {
          id: 20729953,
          description: '',
          name: 'Test Repo Merico',
          name_with_namespace: 'Jonathan ODonnell / Test Repo Merico',
          path: 'Test-repo-merico',
          path_with_namespace: 'joncodo-merico/Test-repo-merico',
          created_at: '2020-08-25T11:25:30.144Z',
          default_branch: 'master',
          tag_list: [],
          ssh_url_to_repo: 'git@gitlab.com:joncodo-merico/Test-repo-merico.git',
          http_url_to_repo: 'https://gitlab.com/joncodo-merico/Test-repo-merico.git',
          web_url: 'https://gitlab.com/joncodo-merico/Test-repo-merico',
          readme_url: 'https://gitlab.com/joncodo-merico/Test-repo-merico/-/blob/master/README.md',
          avatar_url: null,
          forks_count: 0,
          star_count: 0,
          last_activity_at: '2020-11-04T13:10:33.973Z',
          namespace: {
            id: 8614859,
            name: 'Jonathan ODonnell',
            path: 'joncodo-merico',
            kind: 'user',
            full_path: 'joncodo-merico',
            parent_id: null,
            avatar_url: '/uploads/-/system/user/avatar/6460561/avatar.png',
            web_url: 'https://gitlab.com/joncodo-merico'
          }
        }
      ]
    }
  },
  models: {
    badge() {
      return {
        name: `Badge-Name-${(randomNumber())}`,
        type: 'linguist',
        grade: 'GOLD',
        description: `Description-${randomNumber()}`,
        imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/71GY2nNtUcL.jpg',
        isPublic: true
      }
    },
    user() {
      return {
        photos: [],
        displayName: 'AuthTest User',
        username: `my-github-username${randomNumber()}`,
        _json: {
          url: 'https://api.github.com/users/my-github-username'
        },
        githubAccessToken: 'f437hf3f834gf8w34g',
        githubRefreshToken: 'jfl54ghsl57hles2rf',
        primaryEmail: `jon${randomNumber()}@test.com`
      }
    },
    project() {
      return {
        url: `https://github.com/fake${randomNumber()}/my-project`,
        gitUrl: `git://github.com/fake-${randomNumber()}/my-project.git`,
        name: `fake${randomNumber()}`,
        eeProjectId: uuidv4()
      }
    },
    notification() {
      return {
        message: `This is a message ${randomNumber()}`,
        url: `https://fake${randomNumber()}.merico.build`
      }
    },
    contributor() {
      return {
        email: `example-${randomNumber()}@test.com`,
        userId: null,
        remoteId: randomNumber(),
        username: 'fun-name',
        displayName: 'Example Contributor',
        profileUrl: '',
        photoUrl: 'DataTypes.STRING',
        provider: 'github'
      }
    },
    pullRequest(projectId = null, authorId = null, userId = null) {
      return {
        project: projectId,
        author: authorId,
        user: userId,
        provider: 'github',
        state: 'merged',
        apiUrl: '',
        remoteId: 12345667,
        mergeCommit: 'bacon'
      }
    }
  },
  responses: {
    user: {
      photos: [],
      displayName: 'AuthTest User',
      username: 'my-github-username',
      _json: {
        url: 'https://api.github.com/users/my-github-username',
      },
      githubAccessToken: 'f437hf3f834gf8w34g',
      githubRefreshToken: 'jfl54ghsl57hles2rf',
      primaryEmail: 'foo@foo.com'
    },
    gitlabUser: {
      avatarUrl: '',
      displayName: 'Gitlab User',
      username: 'my-gitlab-username',
      gitlabAccessToken: 'f437hf3f834gf8w34g',
      gitlabRefreshToken: 'jfl54ghsl57hles2rf',
      emails: [{
        value: 'test@merico.dev'
      }]
    },
  },
  requests: {
    project: {
      create() {
        return {
          gitUrl: `git://github.com/fake-user/fake-repo-${randomNumber()}.git`,
          url: `https://github.com/fake-user/fake-repo-${randomNumber()}`,
          name: `fake-repo-${randomNumber()}`,
        }
      },
      createMany: [{
          gitUrl: 'git://github.com/mericoqa1/fake-repo1.git',
          name: 'fake-repo2',
          provider: 'github',
          url: 'https://api.github.com/repos/mericoqa1/fake-repo1',
        },
        {
          gitUrl: 'git://github.com/mericoqa1/fake-repo2.git',
          name: 'fake-repo2',
          provider: 'github',
          url: 'https://api.github.com/repos/mericoqa1/fake-repo2',
        },
      ],
    },
  },
  db: {
    user: {
      create: {
        github: {
          primaryEmail: 'test@merico.dev',
          displayName: 'AuthTest Github User',
          githubUsername: 'my-github-username',
          githubAccessToken: 'f437hf3f834gf8w34g',
          githubRefreshToken: 'jfl54ghsl57hles2rf',
        },
        gitlab: {
          primaryEmail: {
            value: 'test@merico.dev'
          },
          displayName: 'AuthTest Gitlab User',
          avatarUrl: '',
          gitlabUsername: 'my-gitlab-username',
          gitlabAccessToken: 'f437hf3f834gf8w34g',
          gitlabRefreshToken: 'jfl54ghsl57hles2rf',
        }
      },
    },
    project: {
      create: {
        url: 'https://api.github.com/repos/mericoqa1/fake-repo1',
        gitUrl: 'git://github.com/mericoqa1/fake-repo1.git',
        name: 'Fake Repo 1',
      },
      createMany: [{
          gitUrl: 'git://github.com/mericoqa1/fake-repo1.git',
          name: 'fake-repo2',
          url: 'https://api.github.com/repos/mericoqa1/fake-repo1',
          eeProjectId: 'e2206472-e246-429f-ac37-d9778e5efa86'
        },
        {
          gitUrl: 'git://github.com/mericoqa1/fake-repo2.git',
          name: 'fake-repo2',
          url: 'https://api.github.com/repos/mericoqa1/fake-repo2',
          eeProjectId: '1741b126-a723-421b-9b7f-21b53c276455'
        },
      ],
    }
  },
  messages: {
    submitRepoResponse: {
      analysis_id: uuidv4(),
      error: 'EMPTY',
      report_id: '',
    },
  }
}
