import requests
import json
import random
from strgen import StringGenerator
from random_object_id import generate
from PIL import Image

# Token de Json Generator y header para las llamadas
token = 't96m1j7j72b9k902fh6nbq1mge634l4hwhu3s4mr'
headers = {
    'Authorization': f'Bearer {token}',
}

# Links a los objetos
actors_link = 'https://api.json-generator.com/templates/-F3GkxKB0Ijy/data'
finders_link = 'https://api.json-generator.com/templates/W6FL56Vq8OHe/data'
trips_link = 'https://api.json-generator.com/templates/MAjoYxqQiLEx/data'
applications_link = "https://api.json-generator.com/templates/19rlFoDVORqa/data"
stages_link = "https://api.json-generator.com/templates/_2mxxZUYLw2d/data"
sponsorships_link = "https://api.json-generator.com/templates/WSaUCdMEoxLL/data"

#Creación de los archivos Json
actors_file = open('actors.json', 'w+')
finders_file = open('finders.json', 'w+')
trips_file = open('trips.json', 'w+')
applications_file = open('applications.json', 'w+')
stages_file = open('stages.json', 'w+')
sponsorships_file = open('sponsorships.json', 'w+')
pictures_file = open('pictures.json', 'w+')

actors_file.write('[\n')
finders_file.write('[\n')
trips_file.write('[\n')
applications_file.write('[\n')
stages_file.write('[\n')
sponsorships_file.write('[\n')
pictures_file.write('[\n')

# Peticiones y respuestas a la API de Json Generator
actors_request = requests.get(actors_link, headers = headers)
finders_request = requests.get(finders_link, headers = headers)
trips_request = requests.get(trips_link, headers = headers)
applications_request = requests.get(applications_link, headers = headers)
stages_request = requests.get(stages_link, headers = headers)
sponsorships_request = requests.get(sponsorships_link, headers = headers)

actors_response = actors_request.json()
finders_response = finders_request.json()
trips_response = trips_request.json()
applications_response = applications_request.json()
stages_response = stages_request.json()
sponsorships_response = sponsorships_request.json()

# Recalcula el precio del trip para sus stages
def recalculate(stages):
    return sum([stage['price'] for stage in stages])

# Separa los elementos por comas
def put_coma(file):
    file.write(',\n')

# Elige objetos randoms para crear las relaciones
def get_random_objects(response, num):
    # Numero de objetos aleatorios
    num_objects = random.choice(range(1, num))

    # Elegimos los objectos aleatorios
    random_objects = [random.choice(range(0,1000)) for _ in range(0, num_objects)]
    # Elegimos los objectos aleatorios
    objects = [response[x] for x in random_objects]

    return objects

def get_object(response, _id):
    for item in response:
        if item['_id'] == _id:
            return item

for i in range(0, 1):

    # Listas para controlar que no se repiten objetos con el mismo id en los Json
    stage_ids = list()
    finder_ids = list()
    applications_ids = list()
    sponsorship_ids = list()
    trip_ids = list()
    picture_ids = list()
    
    pictures = list()

    # Generacion de IDs, relaciones y atributos únicos
    for finder in finders_response:
    
        finder_id = generate()

        finder.update({'_id': finder_id})

    for stage in stages_response:

        stage_id = generate()

        stage.update({'_id': stage_id})

    for application in applications_response:

        application_id = generate()

        application.update({'_id': application_id, 'trip': None})

    for sponsorship in sponsorships_response:

        sponsorship_id = generate()

        img = Image.new('RGB', (15, 15), color='green')

        sponsorship.update({'_id': sponsorship_id, 'banner': img.tobytes().decode("latin1"), 'trip': None})

    for trip in trips_response:

        trip_id = generate()

        # Stages aleatorios
        stages = get_random_objects(stages_response, 4)
        for stage in stages:
            stage.update({'trip': trip_id})

        ticker = StringGenerator("[0-9]{8}[-][A-Z]{4}").render(unique = True)

        img = Image.new('RGB', (15, 15), color='red')
        picture = {'_id': generate(), 'picture': img.tobytes().decode("latin1"), 'trip': trip_id}
        pictures.append(picture)

        trip.update({
            'ticker': ticker, 
            'price': recalculate(stages), 
            '_id': trip_id, 
            'stages': [stage['_id'] for stage in stages], 
            'applications': [], 
            'sponsorships': [], 
            'pictures': [picture['_id']]
        })

    # Sponsorships temporales para asignarselos a trips
    temp_sponsorships = list()

    # Applications temporales para asignarselos a trips
    temp_applications = list()

    for actor in actors_response:

        actor_id = generate()

        # Trips aleatorios
        trips = get_random_objects(trips_response, 7)

        # Sponsorships aleatorios
        sponsorships = get_random_objects(sponsorships_response, 15)

        # Applications aleatorios
        applications = get_random_objects(applications_response, 15)

        # Finders aleatorios
        finders = get_random_objects(finders_response, 4)
        for finder in finders:
            finder.update({'actor': actor_id})

        email = StringGenerator("[A-Za-z]{8}[0-9]{4}").render(unique = True) + '@gmail.com'

        if actor['role'] == 'MANAGER':

            for trip in trips:
                trip.update({'manager': actor_id})

            # Añadimos sponsorships que previamente tienen un actor
            for sponsorship in temp_sponsorships:
                trip = trips[random.choice(range(0,len(trips)))]
                if sponsorship['trip'] == None:
                    sponsorship.update({'trip': trip['_id']})
                    trip['sponsorships'].append(sponsorship['_id'])

                temp_sponsorships = list()

            # Añadimos applications que previamente tienen un actor
            for application in temp_applications:
                trip = trips[random.choice(range(0,len(trips)))]

                if application['trip'] == None:
                    application.update({'trip': trip['_id']})
                    trip['applications'].append(application['_id'])

                # print(application)

                temp_applications = list()


            actor.update({
                '_id': actor_id, 
                'applications': [application['_id'] for  application in applications], 
                'trips': [trip['_id'] for trip in trips], 
                'finders': [finder['_id'] for finder in finders], 
                'email': email
            })

        elif actor['role'] == 'SPONSOR':

            temp_sponsorships.extend(sponsorships)

            for sponsorship in sponsorships:
                sponsorship.update({'actor': actor_id})

            actor.update({
                '_id': actor_id,
                'sponsorships': [sponsorship['_id'] for  sponsorship in sponsorships],
                'finders': [finder['_id'] for finder in finders],
                'email': email
            })

        elif actor['role'] == 'EXPLORER':

            temp_applications.extend(applications)

            for application in applications:
                application.update({'actor': actor_id})

            actor.update({
                '_id': actor_id,
                'applications': [application['_id'] for  application in applications],
                'finders': [finder['_id'] for finder in finders],
                'email': email
            })

        else:
            
            actor.update({
                '_id': actor_id, 
                'email': email
            })

        # Carga de los objetos en los Json
        if actor['role'] == 'MANAGER':

            for trip in trips:
                if trip['_id'] not in trip_ids:
                    trip_ids.append(trip['_id'])
                    json.dump(trip, trips_file, indent=2)
                    put_coma(trips_file)

                for sponsorship_id in trip['sponsorships']:
                    if sponsorship_id not in sponsorship_ids:
                        sponsorship_ids.append(sponsorship_id)
                        sponsorship = get_object(sponsorships_response, sponsorship_id)
                        json.dump(sponsorship, sponsorships_file, indent=2)
                        put_coma(sponsorships_file)

                for stage_id in trip['stages']:
                    if stage_id not in stage_ids:
                        stage_ids.append(stage_id)
                        stage = get_object(stages_response, stage_id)
                        json.dump(stage, stages_file, indent=2)
                        put_coma(stages_file)

                for application_id in trip['applications']:
                    if application_id not in applications_ids:
                        applications_ids.append(application_id)
                        application = get_object(applications_response, application_id)
                        json.dump(application, applications_file, indent=2)
                        put_coma(applications_file)

                for picture_id in trip['pictures']:
                    if picture_id not in picture_ids:
                        picture_ids.append(picture_id)
                        picture = get_object(pictures, picture_id)
                        json.dump(picture, pictures_file, indent=2)
                        put_coma(pictures_file)

        for finder in finders:
            if finder['_id'] not in finder_ids:
                finder_ids.append(finder['_id'])
                json.dump(finder, finders_file, indent=2)
                put_coma(finders_file)

        json.dump(actor, actors_file, indent=2)

        if actor['name'] != actors_response[-1]['name'] or i != 0:
            put_coma(actors_file)

    print(i)

# Cierre de los Json y guardado
json.dump({}, trips_file, indent=2)
json.dump({}, applications_file, indent=2)
json.dump({}, stages_file, indent=2)
json.dump({}, sponsorships_file, indent=2)
json.dump({}, pictures_file, indent=2)
json.dump({}, finders_file, indent=2)

actors_file.write('\n]')
finders_file.write('\n]')
trips_file.write('\n]')
applications_file.write('\n]')
stages_file.write('\n]')
sponsorships_file.write('\n]')
pictures_file.write('\n]')

actors_file.close()
finders_file.close()
pictures_file.close()
trips_file.close()
applications_file.close()
stages_file.close()
sponsorships_file.close()