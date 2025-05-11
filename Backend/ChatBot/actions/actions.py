import os
import sys
import django

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

# Setting up the Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Project.settings")
django.setup()

from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.types import DomainDict
from rasa_sdk.executor import CollectingDispatcher
from django.apps import apps
from django.db.models import Q
from datetime import date
from asgiref.sync import sync_to_async

# ✅ Download the Movie model from your app
# Replace 'your_app_name' with the name of the app that contains the Movie model
Movie = apps.get_model('Movies', 'Movie')

# ✅ A function to help search for a movie by name
@sync_to_async
def get_movie_by_name(name):
    try:
        return Movie.objects.get(title__iexact=name.strip())
    except Movie.DoesNotExist:
        return None

class ActionGreet(Action):
    def name(self) -> Text:
        return "action_greet"

    async def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        dispatcher.utter_message(response="utter_greet")
        return []

class ActionGoodbye(Action):
    def name(self) -> Text:
        return "action_goodbye"

    async def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        dispatcher.utter_message(response="utter_goodbye")
        return []
    
class ActionHelp(Action):
    def name(self) -> Text:
        return "action_help"

    async def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        dispatcher.utter_message(response="utter_help")

class ActionBotChallenge(Action):
    def name(self) -> Text:
        return "action_bot_challenge"

    async def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        dispatcher.utter_message(response="utter_iamabot")
        return []

class ActionAffirm(Action):
    def name(self) -> Text:
        return "action_affirm"

    async def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        dispatcher.utter_message(response="utter_affirm")
        return []

class ActionDeny(Action):
    def name(self) -> Text:
        return "action_deny"

    async def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        dispatcher.utter_message(response="utter_deny")
        return []

class ActionFallback(Action):
    def name(self) -> Text:
        return "action_fallback"

    async def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        dispatcher.utter_message(response="utter_fallback")
        return []
    
class ActionAskMovieShowtimes(Action):
    def name(self) -> Text:
        return "action_ask_movie_showtimes"

    async def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        movie_name = tracker.get_slot("movie_name")
        if movie_name:
            try:
                movie = await get_movie_by_name(movie_name)  # استخدام await هنا
                if movie:
                    dispatcher.utter_message(text=f"The showtime for {movie.title} is {movie.showtime}.")
                else:
                    dispatcher.utter_message(text=f"I couldn't find showtime information for {movie_name}.")
            except Exception as e:
                dispatcher.utter_message(text=f"Sorry, an error occurred: {str(e)}")
        else:
            dispatcher.utter_message(text="Please provide the movie name.")
        return []

class ActionAskMovieCast(Action):
    def name(self) -> Text:
        return "action_ask_movie_cast"

    async def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        movie_name = tracker.get_slot("movie_name")
        if movie_name:
            try:
                movie = await get_movie_by_name(movie_name)
                if movie:
                    dispatcher.utter_message(text=f"The cast of {movie.title} includes: {movie.cast}.")
                else:
                    dispatcher.utter_message(text=f"I couldn't find the cast information for {movie_name}.")
            except Exception as e:
                dispatcher.utter_message(text=f"Sorry, an error occurred: {str(e)}")
        else:
            dispatcher.utter_message(text="Please specify the movie name.")
        return []

class ActionAskMovieDirector(Action):
    def name(self) -> Text:
        return "action_ask_movie_director"

    async def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        movie_name = tracker.get_slot("movie_name")
        if movie_name:
            try:
                movie = await get_movie_by_name(movie_name)
                if movie:
                    dispatcher.utter_message(text=f"The director of {movie.title} is {movie.director}.")
                else:
                    dispatcher.utter_message(text=f"I couldn't find the director for {movie_name}.")
            except Exception as e:
                dispatcher.utter_message(text=f"Sorry, an error occurred: {str(e)}")
        else:
            dispatcher.utter_message(text="Please provide the movie name.")
        return []

class ActionAskMovieRating(Action):
    def name(self) -> Text:
        return "action_ask_movie_rating"

    async def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        movie_name = tracker.get_slot("movie_name")
        if movie_name:
            try:
                movie = await get_movie_by_name(movie_name)
                if movie:
                    dispatcher.utter_message(text=f"{movie.title} has a rating of {movie.rating}.")
                else:
                    dispatcher.utter_message(text=f"Rating info for {movie_name} not found.")
            except Exception as e:
                dispatcher.utter_message(text=f"Sorry, an error occurred: {str(e)}")
        else:
            dispatcher.utter_message(text="Please mention the movie name.")
        return []

class ActionAskMovieGenre(Action):
    def name(self) -> Text:
        return "action_ask_movie_genre"

    async def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        movie_name = tracker.get_slot("movie_name")
        if movie_name:
            try:
                movie = await get_movie_by_name(movie_name)
                if movie:
                    dispatcher.utter_message(text=f"{movie.title} belongs to the {movie.genre} genre.")
                else:
                    dispatcher.utter_message(text=f"I couldn't find the genre for {movie_name}.")
            except Exception as e:
                dispatcher.utter_message(text=f"Sorry, an error occurred: {str(e)}")
        else:
            dispatcher.utter_message(text="Please provide the movie name.")
        return []

class ActionAskMovieLocation(Action):
    def name(self) -> Text:
        return "action_ask_movie_location"

    async def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        movie_name = tracker.get_slot("movie_name")
        if movie_name:
            try:
                movie = await get_movie_by_name(movie_name)
                if movie:
                    dispatcher.utter_message(text=f"{movie.title} is being screened at {movie.location}.")
                else:
                    dispatcher.utter_message(text=f"No location info found for {movie_name}.")
            except Exception as e:
                dispatcher.utter_message(text=f"Sorry, an error occurred: {str(e)}")
        else:
            dispatcher.utter_message(text="Please specify the movie name.")
        return []

class ActionAskTicketValidity(Action):
    def name(self) -> Text:
        return "action_ask_ticket_validity"

    async def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        dispatcher.utter_message(text="Tickets are valid only for the selected showtime and cannot be reused.")
        return []

class ActionAskMovieInfo(Action):
    def name(self) -> Text:
        return "action_ask_movie_info"

    async def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        movie_name = tracker.get_slot("movie_name")
        if not movie_name:
            dispatcher.utter_message(text="Please tell me the movie name.")
            return []

        try:
            movie = await get_movie_by_name(movie_name)
            if movie:
                response = (
                    f"{movie.title} is a {movie.genre} film directed by {movie.director}. "
                    f"It stars {movie.cast} and runs for {movie.duration} minutes. "
                    f"Rated {movie.rating}, released on {movie.release_date}."
                )
            else:
                response = "Sorry, I couldn't find information about that movie."
        except Exception as e:
            response = f"Sorry, an error occurred: {str(e)}"

        dispatcher.utter_message(text=response)
        return []

class ActionAskReleaseDate(Action):
    def name(self) -> Text:
        return "action_ask_release_date"

    async def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        movie_name = tracker.get_slot("movie_name")
        if movie_name:
            try:
                movie = await get_movie_by_name(movie_name)
                if movie:
                    dispatcher.utter_message(text=f"{movie.title} was released on {movie.release_date}.")
                else:
                    dispatcher.utter_message(text=f"I couldn't find the release date for {movie_name}.")
            except Exception as e:
                dispatcher.utter_message(text=f"Sorry, an error occurred: {str(e)}")
        else:
            dispatcher.utter_message(text="Please specify the movie name.")
        return []

class ActionAskTicketPrice(Action):
    def name(self) -> Text:
        return "action_ask_ticket_price"

    async def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        dispatcher.utter_message(text="The standard ticket price is 100 EGP. Premium options may cost more depending on the cinema.")
        return []

class ActionAskMovieDuration(Action):
    def name(self) -> Text:
        return "action_ask_movie_duration"

    async def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        movie_name = tracker.get_slot("movie_name")
        if movie_name:
            try:
                movie = await get_movie_by_name(movie_name)
                if movie:
                    dispatcher.utter_message(text=f"The duration of {movie.title} is {movie.duration} minutes.")
                else:
                    dispatcher.utter_message(text=f"I couldn't find the movie {movie_name}.")
            except Exception as e:
                dispatcher.utter_message(text=f"Sorry, an error occurred: {str(e)}")
        else:
            dispatcher.utter_message(text="Please specify the movie name.")
        return []

class ActionAskMovieAvailability(Action):
    def name(self) -> Text:
        return "action_ask_movie_availability"

    async def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        movie_name = tracker.get_slot("movie_name")
        if not movie_name:
            dispatcher.utter_message(text="Please specify the movie name.")
            return []

        try:
            movie = await get_movie_by_name(movie_name)
            if movie:
                response = f"{movie.title} is currently {'available' if movie.is_available else 'not available'} in cinemas."
            else:
                response = "I couldn't find availability information for that movie."
        except Exception as e:
            response = f"Sorry, an error occurred: {str(e)}"

        dispatcher.utter_message(text=response)
        return []

class ActionAskMovieLanguage(Action):
    def name(self) -> Text:
        return "action_ask_movie_language"

    async def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        movie_name = tracker.get_slot("movie_name")
        if movie_name:
            try:
                movie = await get_movie_by_name(movie_name)
                if movie:
                    dispatcher.utter_message(text=f"{movie.title} is available in {movie.language}.")
                else:
                    dispatcher.utter_message(text=f"I couldn't find the movie {movie_name}.")
            except Exception as e:
                dispatcher.utter_message(text=f"Sorry, an error occurred: {str(e)}")
        else:
            dispatcher.utter_message(text="Please provide the movie name.")
        return []

class ActionAskMovieSubtitles(Action):
    def name(self) -> Text:
        return "action_ask_movie_subtitles"

    async def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        movie_name = tracker.get_slot("movie_name")
        if movie_name:
            try:
                movie = await get_movie_by_name(movie_name)
                if movie:
                    if movie.subtitles:
                        dispatcher.utter_message(text=f"{movie.title} provides subtitles.")
                    else:
                        dispatcher.utter_message(text=f"{movie.title} does not provide subtitles.")
                else:
                    dispatcher.utter_message(text=f"Sorry, I couldn't find information about {movie_name}.")
            except Exception as e:
                dispatcher.utter_message(text=f"Sorry, an error occurred: {str(e)}")
        else:
            dispatcher.utter_message(text="Please provide the movie name.")
        return []

class ActionAskMovieSuitable(Action):
    def name(self) -> Text:
        return "action_ask_movie_suitable"

    async def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        movie_name = tracker.get_slot("movie_name")
        if movie_name:
            try:
                movie = await get_movie_by_name(movie_name)
                if movie:
                    dispatcher.utter_message(text=f"{movie.title} is suitable for ages: {movie.age_rating}.")
                else:
                    dispatcher.utter_message(text=f"I couldn't find the movie {movie_name}.")
            except Exception as e:
                dispatcher.utter_message(text=f"Sorry, an error occurred: {str(e)}")
        else:
            dispatcher.utter_message(text="Please provide the movie name.")
        return []

@sync_to_async
def filter_movies_by_genre(genre):
    return list(Movie.objects.filter(genre__icontains=genre)[:5])
class ActionAskGenreRecommendation(Action):
    def name(self) -> Text:
        return "action_ask_genre_recommendation"

    async def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        genre = tracker.get_slot("genre")
        if not genre:
            dispatcher.utter_message(text="Which genre do you prefer?")
            return []

        try:
            movies = await filter_movies_by_genre(genre)
            if movies:
                titles = ", ".join([m.title for m in movies])
                response = f"Here are some {genre} movies: {titles}."
            else:
                response = f"I couldn't find any movies in the {genre} genre."
        except Exception as e:
            response = f"Sorry, an error occurred: {str(e)}"

        dispatcher.utter_message(text=response)
        return []

@sync_to_async
def filter_family_friendly_movies():
    return list(Movie.objects.filter(age_rating__in=["G", "PG", "PG-13"])[:5])
class ActionAskFamilyFriendly(Action):
    def name(self) -> Text:
        return "action_ask_family_friendly"

    async def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        try:
            movies = await filter_family_friendly_movies()
            if movies:
                titles = ", ".join([m.title for m in movies])
                response = f"These are family-friendly movies: {titles}."
            else:
                response = "I couldn't find family-friendly movies right now."
        except Exception as e:
            response = f"Sorry, an error occurred: {str(e)}"

        dispatcher.utter_message(text=response)
        return []

class ActionAskMovieTheaterAvailability(Action):
    def name(self) -> Text:
        return "action_ask_movie_theater_availability"

    async def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        movie_name = tracker.get_slot("movie_name")
        if not movie_name:
            dispatcher.utter_message(text="Please provide the movie name.")
            return []

        try:
            movie = await get_movie_by_name(movie_name)
            if movie:
                response = f"{movie.title} is being shown at: {movie.location}" if movie.is_available else f"{movie.title} is not currently in theaters."
            else:
                response = "Sorry, I couldn't find that movie in theaters."
        except Exception as e:
            response = f"Sorry, an error occurred: {str(e)}"

        dispatcher.utter_message(text=response)
        return []

class ActionAskUserRating(Action):
    def name(self) -> Text:
        return "action_ask_user_rating"

    async def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        movie_name = tracker.get_slot("movie_name")
        if not movie_name:
            dispatcher.utter_message(text="Which movie are you asking about?")
            return []

        try:
            movie = await get_movie_by_name(movie_name)
            if movie:
                response = f"The user rating for {movie.title} is {movie.user_rating}/10."
            else:
                response = "I couldn't find user rating information for that movie."
        except Exception as e:
            response = f"Sorry, an error occurred: {str(e)}"

        dispatcher.utter_message(text=response)
        return []

@sync_to_async
def filter_current_movies():
    return list(Movie.objects.filter(is_available=True))
class ActionAskCurrentMovies(Action):
    def name(self) -> Text:
        return "action_ask_current_movies"

    async def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        try:
            movies = await filter_current_movies()
            if movies:
                titles = ", ".join([m.title for m in movies])
                response = f"Currently showing movies: {titles}."
            else:
                response = "There are no movies showing at the moment."
        except Exception as e:
            response = f"Sorry, an error occurred: {str(e)}"

        dispatcher.utter_message(text=response)
        return []

@sync_to_async
def filter_upcoming_movies(today):
    return list(Movie.objects.filter(release_date__gt=today).order_by('release_date')[:5])
class ActionAskUpcomingReleases(Action):
    def name(self) -> Text:
        return "action_ask_upcoming_releases"

    async def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        today = date.today()
        try:
            upcoming = await filter_upcoming_movies(today)
            if upcoming:
                titles = ", ".join([f"{m.title} ({m.release_date})" for m in upcoming])
                response = f"Upcoming releases: {titles}."
            else:
                response = "No upcoming releases found."
        except Exception as e:
            response = f"Sorry, an error occurred: {str(e)}"

        dispatcher.utter_message(text=response)
        return []

@sync_to_async
def filter_top_rated_movies():
    return list(Movie.objects.order_by("-user_rating")[:5])
class ActionAskTopRatedMovies(Action):
    def name(self) -> Text:
        return "action_ask_top_rated_movies"

    async def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        try:
            movies = await filter_top_rated_movies()
            if movies:
                titles = ", ".join([f"{m.title} ({m.user_rating}/10)" for m in movies])
                response = f"Top-rated movies: {titles}."
            else:
                response = "No top-rated movies found."
        except Exception as e:
            response = f"Sorry, an error occurred: {str(e)}"

        dispatcher.utter_message(text=response)
        return []

@sync_to_async
def filter_festival_movies():
    return list(Movie.objects.exclude(festival="").exclude(festival=None)[:5])
class ActionAskMovieFestivals(Action):
    def name(self) -> Text:
        return "action_ask_movie_festivals"

    async def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        try:
            movies = await filter_festival_movies()
            if movies:
                info = ", ".join([f"{m.title} ({m.festival})" for m in movies])
                response = f"These movies were featured in festivals: {info}."
            else:
                response = "No festival movies found."
        except Exception as e:
            response = f"Sorry, an error occurred: {str(e)}"

        dispatcher.utter_message(text=response)
        return []

class ActionAskMovieSummary(Action):
    def name(self) -> Text:
        return "action_ask_movie_summary"

    async def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        movie_name = tracker.get_slot("movie_name")
        if not movie_name:
            dispatcher.utter_message(text="Please tell me the movie name.")
            return []

        try:
            movie = await get_movie_by_name(movie_name)
            if movie:
                response = f"Here's a summary for {movie.title}: {movie.summary}"
            else:
                response = "Sorry, I couldn't find a summary for that movie."
        except Exception as e:
            response = f"Sorry, an error occurred: {str(e)}"

        dispatcher.utter_message(text=response)
        return []

@sync_to_async
def filter_kid_friendly_movies():
    return list(Movie.objects.filter(age_rating="G")[:5])
class ActionAskKidFriendlyMovies(Action):
    def name(self) -> Text:
        return "action_ask_kid_friendly_movies"

    async def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        try:
            movies = await filter_kid_friendly_movies()
            if movies:
                titles = ", ".join([m.title for m in movies])
                response = f"These are kid-friendly movies: {titles}."
            else:
                response = "No kid-friendly movies available right now."
        except Exception as e:
            response = f"Sorry, an error occurred: {str(e)}"

        dispatcher.utter_message(text=response)
        return []

class ActionAskStreamingPlatform(Action):
    def name(self) -> Text:
        return "action_ask_streaming_platform"

    async def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        movie_name = tracker.get_slot("movie_name")
        if not movie_name:
            dispatcher.utter_message(text="Please provide the movie name.")
            return []

        try:
            movie = await get_movie_by_name(movie_name)
            if movie:
                response = f"{movie.title} is available on: {movie.streaming_platform}" if movie.streaming_platform else "This movie is not available on any streaming platform."
            else:
                response = "I couldn't find streaming information for that movie."
        except Exception as e:
            response = f"Sorry, an error occurred: {str(e)}"

        dispatcher.utter_message(text=response)
        return []

class ActionAsk3DAvailability(Action):
    def name(self) -> Text:
        return "action_ask_3d_availability"

    async def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        movie_name = tracker.get_slot("movie_name")
        if not movie_name:
            dispatcher.utter_message(text="Please provide the movie name.")
            return []

        try:
            movie = await get_movie_by_name(movie_name)
            if movie:
                response = f"{movie.title} {'supports' if movie.is_3d else 'does not support'} 3D viewing."
            else:
                response = "I couldn't find 3D availability information for that movie."
        except Exception as e:
            response = f"Sorry, an error occurred: {str(e)}"

        dispatcher.utter_message(text=response)
        return []