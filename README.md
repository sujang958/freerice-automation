# Freerice Automation

> Requirements  
- Docker v20.10.14 or higher

## Getting started

1. Clone this repository  
2. Write a .env file in accordance with the following format
```env
FR_USER_1=
FR_PW_1=
FR_USER_2=
FR_PW_2=
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
