const bcrypt = require('bcryptjs')
//mongoose.js裡的MONGODB_URI，是環境變數存在.env裡面
//app.js在運行時，除了require('mongoose')，同時也require('.env')，因此app.js可以執行mongodb連線
//但todoSeeder.js在這裏是獨立檔案，要連線mongodb的同樣要和app.js一樣，同時呼叫mongoose.js和.env
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const Todo = require('../todo')
const User = require('../user')
const db = require('../../config/mongoose')
//建立假的user種子資料，可以用帶入json資料方式製作，因為這裡只有要做一組，因此只有建立一個物件
//物件的屬性結構要配合model user的定義方式塞入要求的欄位
const SEED_USER = {
  name: 'root',
  email: 'root@example.com',
  password: '12345678'
}

db.once('open', () => {
  bcrypt
    .genSalt(10)
    .then(salt => bcrypt.hash(SEED_USER.password, salt))
    .then(hash => User.create({
      name: SEED_USER.name,
      email: SEED_USER.email,
      password: hash
    }))
    //User.create之後會回傳一個user
    .then(user => {
      //因為已經製作了一個user，mongodb資料庫中就會有這個user物件的_id value
      //而model todo的屬性結構有要求userId，就把這個userId欄位所要求的值，由剛剛取得的user._id帶入
      const userId = user._id
      //最後再把這個userId做為參數，帶入create產生的種子資料，讓這些種子todo資料都有userId

      //確保Promise.all裡面的程序做完，才會執行後面的then
      //因為Todo.create是「呼叫資料庫請求它建立新資料」，注意是呼叫外部服務，而不是直接動作。原本for呼叫完 10 次就往下走了，並沒有等待資料庫回應。
      return Promise.all(Array.from({ length: 10 }, (_, i) => Todo.create({ name: `name-${i}`, userId })))
    })
    .then(() => {
      console.log('done.')
      process.exit()
    })
})