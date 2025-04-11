import requests
from django.conf import settings
from .models import Movie, Genre

TMDB_API_URL = 'https://api.themoviedb.org/3'

def movie_scrap(page=1):
    api_key = settings.TMDB_API_KEY
    url = f'{TMDB_API_URL}/movie/popular?api_key={api_key}&language=en-US&page={page}'
    
    response = requests.get(url)
    data = response.json()
    
    for movie_data in data['results']:
        title = movie_data['title']
        tmdb_id = movie_data['id']  # Unique TMDB ID for the movie
        poster_url = f"https://image.tmdb.org/t/p/w500{movie_data['poster_path']}"
        release_date = movie_data['release_date']
        imdb_rating = movie_data.get('vote_average', 0)
        description = movie_data.get('overview', '')
        
        # Check if the movie already exists in the database by its TMDB ID
        movie, created = Movie.objects.get_or_create(
            id=tmdb_id,  # Assuming TMDB ID is unique, this prevents duplicates
            defaults={
                'title': title,
                'poster': poster_url,
                'release_date': release_date,
                'imdb_rating': imdb_rating,
                'description': description,
                'actors': "",  # Adjust if you can extract actors
                'director': "",  # Adjust if you can extract director
                'views_count': 0,
                'is_recent': False,
                'trailer_url': "",  # Adjust if you can extract trailer URL
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

        # Genre handling (you can adjust this logic if needed)
        genres = []
        for genre in movie_data.get('genre_ids', []):
            genre_obj, created = Genre.objects.get_or_create(id=genre, type=genre)
            genres.append(genre_obj)
        movie.genres.set(genres)
        movie.save()

    return data
