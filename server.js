const http = require("http");
const fs = require("fs");

const users = [
  { id: 1, name: "Mirislam", age: 15 },
  { id: 2, name: "Almaz", age: 15 },
  { id: 3, name: "Baygazy", age: 19 },
];

// Функция обработчик данных с клиента
function getReqData(req) {
  return new Promise(async (resolve, reject) => {
    try {
      const buffers = [];
      for await (const chunk of req) {
        buffers.push(chunk);
      }
      const data = JSON.parse(Buffer.concat(buffers).toString());
      resolve(data);
    } catch (err) {
      reject(err);
    }
  });
}

http
  .createServer(async (request, response) => {
    if (request.url === "/api/users" && request.method === "GET") {
      response.end(JSON.stringify(users));
    } else if (
      request.url.match(/\/api\/users\/([0-9]+)/) &&
      request.method === "DELETE"
    ) {
      const id = request.url.split("/")[3];
      const userIndex = users.findIndex((u) => u.id === parseInt(id));

      if (userIndex > -1) {
        const user = users.splice(userIndex, 1)[0];
        response.end(JSON.stringify(user));
      } else {
        response.writeHead(404, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ message: "Пользователь не найден" }));
      }
    }

    // добавление пользователя
    else if (request.url === "/api/users" && request.method === "POST") {
      try {
        // получаем данные пользователя
        const userData = await getReqData(request);
        // создаем нового пользователя
        const user = { name: userData.name, age: userData.age };
        // находим максимальный id
        const id = Math.max.apply(
          Math,
          users.map(function (u) {
            return u.id;
          })
        );
        // увеличиваем его на единицу
        user.id = id + 1;
        // добавляем пользователя в массив
        users.push(user);
        response.end(JSON.stringify(user));
      } catch (error) {
        response.writeHead(400, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ message: "Некорректный запрос" }));
      }
    }

    //Изменение пользователя
    else if (request.url === "/api/users" && request.method === "PUT") {
      try {
        const userData = await getReqData(request);
        const user = users.find((u) => u.id === parseInt(userData.id));
        
        if (user) {
          user.age = userData.age;
          user.name = userData.name;
          response.end(JSON.stringify(user));
        } else {
          response.writeHead(400, {"Content-Type": "application/json" });
          response.end(JSON.stringify({ message: "Пользователь не найден" }));
        }
      } catch (error) {
        response.writeHead(400, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ message: "Пользователь не найден" }));
      }
    } 
    else if(request.url.match(/\/api\/users\/([0-9]+)/) && request.method === "GET" ){
      const id = request.url.split("/")[3]
      const user = users.find(u => u.id === parseInt(id))

      if(user){
        response.end(JSON.stringify(user))
      }else{
        response.writeHead(400, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ message: "Пользователь не найден" }));
      }

    }    
    else if (request.url === "/" || request.url === "/index.html") {
      fs.readFile("index.html", (err, data) => response.end(data));
    } else {
      response.writeHead(404, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ message: "Рееруср не найден" }));
    }
  })
  .listen(3333, () =>
    console.log("Сервер запущен по адресу http://localhost:3333")
  );
