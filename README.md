# Freerice Automation

> Version Requirements  
- Docker v20.10.14

> Getting started

1. Push this repository  
2. Write .env file according to the format below
```env
USER_NAME = 
USER_PW = 
```
3. Build a docker container
```sh
$ docker build -t freerice_macro:1.0 ./
```
4. Start the docker container
```sh
$ docker run -dit --restart always --name freerice_macro_1 freerice_macro:1.0
```

That's all
