const gitlab = require('../api/util/gitlab')

const foo = async () => {
  try {
    const results = await gitlab.test()
    console.log(results)
  } catch (error) {
    console.log(error)
  }
}

foo()
