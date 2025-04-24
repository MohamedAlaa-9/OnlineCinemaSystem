import requests
from django.conf import settings
from .models import Movie, Genre
from rest_framework.response import Response

TMDB_API_URL = 'https://api.themoviedb.org/3'

def movie_scrap(page=1):
    api_key = settings.TMDB_API_KEY
    url = f'{TMDB_API_URL}/movie/popular?api_key={api_key}&language=en-US&page={page}'
    response = requests.get(url)
    data = response.json()
    for movie_data in data['results']:

        title = movie_data['title']
        tmdb_id = movie_data['id']
        poster_url = f"https://image.tmdb.org/t/p/w500{movie_data['poster_path']}"
        release_date = movie_data['release_date']
        imdb_rating = movie_data.get('vote_average', 0)
        description = movie_data.get('overview', '')
        TMDB_VIDEOS_URL = 'https://api.themoviedb.org/3/movie/{movie_id}/videos'
        video_response = requests.get(
            TMDB_VIDEOS_URL.format(movie_id=tmdb_id),
            params={"api_key": api_key, "language": "en-US"}
        )
        CAST_URL = f'https://api.themoviedb.org/3/movie/{tmdb_id}/credits?api_key={settings.TMDB_API_KEY}&language=en-US'
        cast_response = requests.get(CAST_URL)
        cast_data = cast_response.json()
        for key in video_response.json().get('results', []):
            if key.get('type') == 'Trailer':
                trailer_key = key.get('key')
                break
        else:
            trailer_key = None
        genres_api_link = f'{TMDB_API_URL}/movie/{tmdb_id}?api_key={api_key}'
        genres_response = requests.get(genres_api_link)
        genres_data = genres_response.json()
        for genre in genres_data['genres']:
            gerne_id = genre['id']
            genre_name = genre['name']
            genre, created = Genre.objects.get_or_create(
                type=genre_name,
                defaults={'type_id': gerne_id},
            )
            if created:
                genre.save()
        actors = [person['name'] for person in cast_data['cast'] if person['known_for_department'] == 'Acting']
        
        directors = [person['name'] for person in cast_data['crew'] if person['job'] == 'Director']

        movie, created = Movie.objects.get_or_create(
            id=tmdb_id,
            defaults={
                'title': title,
                'poster': poster_url,
                'release_date': release_date,
                'imdb_rating': imdb_rating,
                'description': description,
                'actors': actors,
                'director': directors,
                'trailer_url': f"https://www.youtube.com/embed/{trailer_key}",
                'seats_available': 100,
                'total_seats': 100,
            }
        )

        # If the movie already exists, update its details
        if not created:
            movie.title = title
            movie.poster = poster_url
            movie.release_date = release_date
            movie.imdb_rating = imdb_rating
            movie.description = description
            movie.save()

    return data

