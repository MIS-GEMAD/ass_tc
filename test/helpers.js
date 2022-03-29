
const app = require('../app');
const supertest = require('supertest');
const api = supertest(app);

const actores_Iniciales = [
    {
        "password": "123456ABCDEFGH",
        "role": [
            "EXPLORER"
        ],
        "name": "Antonio",
        "surname": "García",
        "email": "antoniogarcia1231@gmail.com",
        "phone": "623154879",
        "address": "Calle Resolana",
        "trips": ["6219fe03d6e229826747ebc7","6219fe03d6e229826747ebc8"],
        "applications": [],
        "search_criteria": [],
        "sponshorships": [],
        "validated": false,
        "preferred_language": "Spanish"
        
    },
    {   
        "password": "kdfnaosnfdspa",
        "role": [
            "EXPLORER"
        ],
        "name": "ANthony",
        "surname": "Martial",
        "email": "antonioMartial12311@gmail.com",
        "phone": "623154881",
        "address": "Calle Torreblanca",
        "trips": ["6219fe03d6e229826747ebc7","6219fe03d6e229826747ebc9"],
        "applications": [],
        "search_criteria": [],
        "sponshorships": [],
        "validated": false,
        "preferred_language": "English"
    },
    {
        "password": "kdfnaosnffdsfdspa",
        "role": [
            "SPONSOR"
        ],
        "name": "ANthoniy",
        "surname": "Martial",
        "email": "antonioMartial12311211@gmail.com",
        "phone": "623154881",
        "address": "Calle Torreblanca",
        "trips": ["6219fe03d6e229826747ebc7","6219fe03d6e229826747ebc9"],
        "applications": [],
        "search_criteria": [],
        "sponshorships": [],
        "validated": false,
        "preferred_language": "English"
    }
];

const trips_Iniciales = [
    {
        "ticker": "202102-ABCD",
        "title": "viaje a matalascañas1",
        "description": "Esto es una descripcion hecha por manu.",
        "price": 107.38,
        "requirements": ["Alcohol","Dinero"],
        "startDate": "2023-01-03T22:47:50.569Z",
        "endDate": "2023-11-02T19:16:03.854Z",
        "isCancelled": false,
    },
    {
        "ticker": "202102-ACCD",
        "title": "viaje a chipiona",
        "description": "Esto es una descripcion hecha por manu.",
        "price": 107.38,
        "requirements": ["Alcohol","Dinero"],
        "startDate": "2023-01-03T22:47:50.569Z",
        "endDate": "2023-11-02T19:16:03.854Z",
        "isCancelled": false,
    },
    {
        "ticker": "202102-ABCE",
        "title": "viaje a chipiona",
        "description": "Esto es una descripcion hecha por manu.",
        "price": 107.38,
        "requirements": ["Alcohol","Dinero"],
        "startDate": "2023-01-03T22:47:50.569Z",
        "endDate": "2023-11-02T19:16:03.854Z",
        "isCancelled": true,
    }
]

const applications_Iniciales =[
    {

        "moment": "2022-01-03T22:47:50.569Z",
        "status":"PENDING"
    },
    {

        "moment": "2022-01-03T22:47:50.569Z",
        "status":"ACCEPTED"
    },
    {
    
        "moment": "2022-01-03T22:47:50.569Z",
        "status":"DUE"
    }

]

const stages_iniciales = [
    {

        "title": "CHIPIONA 2014",
        "description": "CHIPIONA Con los chavales 2014",
        "price": 28.55
    },
    {
     
        "title": "CHIPIONA 2016",
        "description": "CHIPIONA Con los chavales 2016",
        "price": 28.55
    },
    {

        "title": "CHIPIONA 2019",
        "description": "CHIPIONA Con los chavales 2016",
        "price": 28.55
    }
]

const sponshorships_iniciales = [
    {

        "banner": "http://google.es",
        "link": "http://aliqua.com/81e03759-bb85-409e-bdf9-1ed3f5f63b17",
        "is_paid":false
    },
    {

        "banner": "http://google.uk",
        "link": "http://aliqua.com/81e03759-bb85-409e-bdf9-1ed3f5f63b17",
        "is_paid":true
    },
    {

        "banner": "http://google.fr",
        "link": "http://aliqua.com/81e03759-bb85-409e-bdf9-1ed3f5f63b17",
        "is_paid":true
    }
]

const getTrips = async()=>{
    const response = await api.get('/trips');
    return {response}
}

const getActors = async()=>{
    const response = await api.get('/actors');
    return {response}
}


const getApplications = async()=>{
    const response = await api.get('/applications');
    return {response}
}

const getSponsorships = async()=>{
    const response = await api.get('/sponsorships');
    return {response}
}


module.exports = {api,actores_Iniciales,trips_Iniciales,applications_Iniciales,
                    stages_iniciales,sponshorships_iniciales,getTrips,getApplications,
                getActors,getSponsorships}