# Solid Sniffle

This microservice is designed to handle ticket-related operations, such as creation, listing, and updating. It follows a 3-layer architecture comprising Model, Controller, and Service components. The Model layer defines the data structure and behavior of the tickets. The Controller layer handles the incoming requests and orchestrates the flow of data between the Service and external entities. The Service layer contains the business logic and performs the core operations on the tickets, ensuring their integrity and consistency. This modular architecture promotes separation of concerns, maintainability, and scalability, enabling efficient ticket management within the microservice environment.

## Getting Started

These instructions will give you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on deploying the project on a live system.

### Prerequisites

Requirements for the software and other tools to build, test and push:

- [Docker](https://www.docker.com/products/docker-desktop/)
- [Node.js](https://nodejs.org/en/download)

### Installing

If you don't want any headache configuring things, copy the following command below, and wait until the install process ends:

```
  curl -k -o- https://raw.githubusercontent.com/ronniery/solid-sniffle/master/install.sh | bash
```

However, if you want something more "hands-on", here is what you're looking for:

1. Checkout project locally
2. Go inside the created folder `solid-sniffle`, then run `npm install`
3. If you want to run it locally:
   - Run the command `npm run start`
4. If you want to run tests, run the command `npm run test`
5. If you want to run docker locally:
   - Run inside the project folder `docker build -t rbcorrea/solid-sniffle .` to build the docker image locally
   - Wait until the process finishes, and then you can run `docker run -d -p 46000:46000 rbcorrea/solid-sniffle` to spin up a container using the previous image
6. If you want to see everything together go to [ronniery/glowing-memory](https://github.com/ronniery/glowing-memory) and follow the necessary steps to run the frontend locally

### Useful URLS

- http://localhost:46000/swagger - You can find complete and interactive documentation made using swagger
- http://localhost:46000/tickets (get) - You can get a list of available tickets
- http://localhost:46000/tickets (post) - You can create a new ticket
- http://localhost:46000/tickets/:id (put) - you can update an existing ticket

### Design, choices, and assumptions

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;For the backend application, I decided to play safe with a 3 layered architecture that involves Controller, Model, and Service, making it simple and robust, going that way, thinking in a real environment, could help me leverage on the knowledge that others developers already have about that architecture, making easy the integration of new developers, it can also lead us to add and remove new functionalities without so many difficulties, the separation of responsibilities when respected here, can empower the developer team.<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; On top of that microservice, I've used Joi as a schema validator library it makes the validation process seamless, easy to extend, improve and debug when necessary, depending of the situation we can use it to cast some values to keep a consistent data layer within our services.
I also tried to create tests for every part of the application, and I used GitHub actions to help me deploy new Docker images from every push I've made inside the repository, as you can check [here](https://hub.docker.com/r/rbcorrea/solid-sniffle)
