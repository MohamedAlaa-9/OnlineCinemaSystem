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
        video_data = video_response.json()
        views = movie_data.get('popularity', 0)
        CAST_URL = f'https://api.themoviedb.org/3/movie/{tmdb_id}/credits?api_key={settings.TMDB_API_KEY}&language=en-US'
        cast_response = requests.get(CAST_URL)
        cast_data = cast_response.json()
        actors = cast_data.get('cast', 'name')
        directors = cast_data.get('crew', 'name')
        trailers = [
            video for video in video_data.get('results', [])
            if video.get('site') == 'YouTube' and video.get('type') == 'Trailer'
        ]

        # Safely get the first trailer's key
        trailer_key = trailers[0]['key'] if trailers else None
        movie_genre_id, movie_genre_name = movie_data.get('genre_ids', []), movie_data.get('genres', ['name'])
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
                'views_count': views,
                'is_recent': True if release_date.rfind('2025') > 0 else False,
                'trailer_url': f"https://www.youtube.com/embed/{trailer_key}",
                'seats_available': 100,
                'total_seats': 100,
                
                
            }
        )
        genre, created = Genre.objects.get_or_create(
            defaults={
                'type': movie_genre_name
            }
        )
        genre.save()

        # If the movie already exists, update its details
        if not created:
            movie.title = title
            movie.poster = poster_url
            movie.release_date = release_date
            movie.imdb_rating = imdb_rating
            movie.description = description
            movie.save()

    return data

# TMDB_API_KEY = settings.TMDB_API_KEY
# TMDB_SEARCH_URL = "https://api.themoviedb.org/3/search/movie"
# TMDB_VIDEOS_URL = "https://api.themoviedb.org/3/movie/{movie_id}/videos"

# def fetch_and_store_movie_trailers():
#     movies = Movie.objects.filter(trailer_url__isnull=True)

#     for movie in movies:
#         try:
#             # Step 1: Search for movie ID by title
#             search_params = {
#                 "api_key": TMDB_API_KEY,
#                 "query": movie.title,
#                 "language": "en-US"
#             }
#             search_response = requests.get(TMDB_SEARCH_URL, params=search_params)
#             search_data = search_response.json()
#             if not search_data["results"]:
#                 print(f"No TMDB result for: {movie.title}")
#                 continue

#             tmdb_id = search_data["results"][0]["id"]

#             # Step 2: Get trailer using the TMDB ID
#             video_response = requests.get(
#                 TMDB_VIDEOS_URL.format(movie_id=tmdb_id),
#                 params={"api_key": TMDB_API_KEY, "language": "en-US"}
#             )
#             video_data = video_response.json()

#             youtube_trailers = [
#                 video for video in video_data.get("results", [])
#                 if video["site"] == "YouTube" and video["type"] == "Trailer"
#             ]

#             if not youtube_trailers:
#                 print(f"No trailer found for: {movie.title}")
#                 continue

#             trailer_key = youtube_trailers[0]["key"]
#             trailer_url = f"https://www.youtube.com/watch?v={trailer_key}"

#             # Step 3: Save to DB
#             movie.trailer_url = trailer_url
#             movie.save()
#             print(f"Trailer saved for: {movie.title}")

#         except Exception as e:
#             print(f"Error processing {movie.title}: {e}")

# def get_trailer(movie_name):
#     movie = Movie.objects.get(title= movie_name)
#     if movie.trailer_url:
#         return movie.trailer_url
#     else:
#         return Response({"error": "Trailer not found"}, status=404)
