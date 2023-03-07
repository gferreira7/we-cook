// To insert in "seeds/movies.seed.js"

const videos = 
    [  {    "title": "Receita de bolo de chocolate",    "reviews": ["Delicioso!", "Amei essa receita"],
    "description": "Essa receita é super fácil de fazer e fica incrível!",
    "tags": ["chocolate", "bolo", "sobremesa"],
    "views": 100,
    "likes": 50,
    "dislikes": 2,
    "recipe": ["1 xícara de açúcar", "1/2 xícara de óleo", "2 ovos", "1 xícara de farinha de trigo", "1/2 xícara de cacau em pó", "1 colher de sopa de fermento em pó", "1/2 xícara de leite"],
    "url": "https://exemplo.com/receita-bolo-chocolate"
  },
  {
    "title": "Receita de lasanha vegetariana",
    "reviews": ["Muito boa!", "Saborosa e saudável"],
    "description": "Essa receita é uma opção deliciosa e saudável para quem quer cortar a carne.",
    "tags": ["lasanha", "vegetariana", "almoço"],
    "views": 75,
    "likes": 40,
    "dislikes": 3,
    "recipe": ["1 pacote de massa de lasanha", "1/2 xícara de molho de tomate", "1/2 xícara de molho branco", "1 berinjela média cortada em cubos", "1 abobrinha média cortada em cubos", "1 cebola média cortada em cubos", "2 dentes de alho picados", "1/2 xícara de queijo ralado"],
    "url": "https://exemplo.com/receita-lasanha-vegetariana"
  },
  {
    "title": "Receita de pão de queijo",
    "reviews": ["Simplesmente maravilhoso!", "Fácil e gostoso"],
    "description": "Essa receita de pão de queijo é perfeita para um café da manhã ou lanche da tarde.",
    "tags": ["pão de queijo", "café da manhã", "lanche"],
    "views": 200,
    "likes": 100,
    "dislikes": 5,
    "recipe": ["1 xícara de polvilho doce", "1 xícara de queijo ralado", "1/2 xícara de leite", "1/4 xícara de óleo", "1 ovo", "1/2 colher de chá de sal"],
    "url": "https://exemplo.com/receita-pao-queijo"
  }
];
  
  // Add here the script that will be run to actually seed the database (feel free to refer to the previous lesson)
  
  // ... your code here
  const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
const Video = require('../models/Video.model');

const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/we-cook";

mongoose
  .connect(MONGO_URI)
  .then(x => {
    console.log(`Connected to Mongo database: "${x.connections[0].name}"`);

    // Create new documents in the books collection
    return Video.create(videos);
  })
  .then(videosFromDb => {
    console.log(`Created ${videosFromDb} videos`);

    // Once the documents are created, close the DB connection
    return mongoose.connection.close();
  })
  .then(() => {
    // Once the DB connection is closed, print a message
    console.log('DB connection closed!');
  })
  .catch(err => {
    console.log(`An error occurred while creating books from the DB: ${err}`);
  });
