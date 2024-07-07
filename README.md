# Peels
## Team Members
The members of the team *Banana Byte* are:
- Yunus Sufian
- Bivas Aryal
- Yasith Medagama Disanayakage
- Ahmet Kucuk
- Imran Mehdiyev
- Hassan Mahmood
- Kota Amemiya
- Medant Sharan
- Yifei Shi


## Project Overview
Peels is a digital journaling web application designed to enhance users' journaling experience by offering digital convenience and creative freedom. The application supports users in maintaining a daily journaling habit by providing predefined templates, mood tracking, multimedia support, export functionalities, and reminder settings. It also incorporates a gamification aspect to encourage consistent journaling practices.


## Deployed Version
The deployed version of Peels has been redacted.


## Installation Instructions
To set up Peels for local development, follow these steps:


### Clone the Repository
```shell
$ git clone https://github.com/yunus04254/peels
```


### Install Dependencies
Navigate into the ***api*** directory and install its dependencies:
```shell
$ cd BananaByte/api
$ npm install
```


Then, navigate into the ***ui*** directory and repeat the installation process:

```shell
$ cd ../ui
$ npm install
```


## Running the Application
Open two terminals. In one, navigate to the ***api*** directory and start the server:

```shell
$ cd api
$ npm start
```

In the second terminal, navigate to the ***ui*** directory and start the client:
```shell
$ cd ui
$ npm start
```

The application should now be running on your local development environment.


## Seeding the Database
To seed the database with initial data, run the following command in the ***api*** directory:

```shell
$ npm run seed
```


## Running Tests
To run tests, execute the following command in either the ***api*** or ***ui*** directory:

```shell
$ npm run test
```


## Running Coverage
To generate a coverage report, use the following command in the ***api*** directory:

```shell
$ npm run test -- --coverage
```

## Running Coverage
To generate a coverage report, use the following command in the ***ui*** directory:

```shell
$ npm test -- --coverage --watchAll
```

## Technology Stack
ReactJS, Express, JEST testing framework

## Disclaimers
This repository has been cloned from a private repository owned by another member of the team.

All instances of confidential authentication keys related to Firebase have been removed, as a result, you may encounter errors when running the application locally. A working deployed version is available upon request.