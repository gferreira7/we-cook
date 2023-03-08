// To insert in "seeds/movies.seed.js"

const videos = 
    [  {    "title": "Receita de bolo de chocolate",    "reviews": ["Delicioso!", "Amei essa receita"],
    "description": "Essa receita é super fácil de fazer e fica incrível!",
    "tags": ["chocolate", "bolo", "sobremesa"],
    "views": 100,
    "likes": 50,
    "dislikes": 2,
    "recipe": ["1 xícara de açúcar", "1/2 xícara de óleo", "2 ovos", "1 xícara de farinha de trigo", "1/2 xícara de cacau em pó", "1 colher de sopa de fermento em pó", "1/2 xícara de leite"],
    "url": "https://cdn.pixabay.com/photo/2010/12/13/10/05/berries-2277_960_720.jpg",
    "owner": "MasterChef"
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
    "url": "https://cdn.pixabay.com/photo/2016/12/26/17/28/spaghetti-1932466_960_720.jpg",
    "owner": "LolYCooks"
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
    "url": "https://cdn.pixabay.com/photo/2015/05/04/10/16/vegetables-752153_960_720.jpg",
    "owner": "Manel da Tasca"
  },
  {
    "title": "Delicious pasta with tomato sauce",
    "reviews": ["Great recipe", "Easy to follow"],
    "description": "This pasta recipe is a family favorite and always a hit at dinner parties.",
    "tags": ["pasta", "dinner", "Italian"],
    "views": 1000,
    "likes": 50,
    "dislikes": 10,
    "recipe": ["1 pound pasta", "1 jar tomato sauce", "1/2 cup grated parmesan cheese"],
    "url": "https://cdn.pixabay.com/photo/2017/09/16/19/21/salad-2756467_960_720.jpg",
    "owner": "ZackSalt"
    },
    {
    "title": "Healthy vegetable stir-fry",
    "reviews": ["Loved this recipe", "Great way to get in more veggies"],
    "description": "This vegetable stir-fry is packed with nutrients and is a great way to eat your veggies.",
    "tags": ["vegetarian", "healthy", "stir-fry"],
    "views": 500,
    "likes": 40,
    "dislikes": 5,
    "recipe": ["2 cups chopped vegetables", "1 tablespoon soy sauce", "1 tablespoon olive oil"],
    "url": "https://cdn.pixabay.com/photo/2017/01/31/09/30/raspberries-2023404_960_720.jpg",
    "owner": "Jonny Cooks"
    },
    {
    "title": "Delicious chocolate cake",
    "reviews": ["Best cake ever", "Moist and decadent"],
    "description": "This chocolate cake recipe is a crowd pleaser and perfect for any occasion.",
    "tags": ["chocolate", "cake", "dessert"],
    "views": 2000,
    "likes": 100,
    "dislikes": 20,
    "recipe": ["1 1/2 cups all-purpose flour", "1 1/2 cups sugar", "1/2 cup cocoa powder"],
    "url": "https://cdn.pixabay.com/photo/2017/07/28/14/29/macarons-2548827_960_720.jpg",
    "owner": "Marie Tomatoes"
    },
    {
    "title": "Simple grilled chicken",
    "reviews": ["Easy and delicious", "Great for weeknight dinners"],
    "description": "This grilled chicken recipe is simple and easy to make, perfect for a quick weeknight dinner.",
    "tags": ["grilled", "chicken", "dinner"],
    "views": 800,
    "likes": 30,
    "dislikes": 5,
    "recipe": ["4 chicken breasts", "1/4 cup olive oil", "2 teaspoons salt"],
    "url": "https://cdn.pixabay.com/photo/2017/10/09/19/29/eat-2834549_960_720.jpg",
    "owner": "GrandMother"
    },
    {
    "title": "Refreshing summer salad",
    "reviews": ["Perfect for hot summer days", "So fresh and delicious"],
    "description": "This summer salad recipe is refreshing and light, perfect for a hot summer day.",
    "tags": ["salad", "summer", "healthy"],
    "views": 600,
    "likes": 25,
    "dislikes": 3,
    "recipe": ["4 cups mixed greens", "1/2 cup sliced strawberries", "1/4 cup balsamic vinaigrette"],
    "url": "https://cdn.pixabay.com/photo/2014/11/05/15/57/salmon-518032_960_720.jpg",
    "owner": "TOpCooks"
    },
    {
    "title": "Homemade pizza",
    "reviews": ["Best pizza ever", "So easy to make"],
    "description": "This homemade pizza recipe is easy to make and always a hit with the family.",
    "tags": ["pizza", "dinner", "Italian"],
    "views": 1500,
    "likes": 75,
    "dislikes": 15,
    "recipe": ["1 pound pizza dough", "1 cup tomato sauce", "1 cup shredded mozzarella cheese"],
    "url":"https://cdn.pixabay.com/photo/2016/03/10/18/44/top-view-1248955_960_720.jpg",
    "owner": "PizzaLover"
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
