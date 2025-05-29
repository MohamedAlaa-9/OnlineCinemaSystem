import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Project.settings')

app = Celery('Project')

app.config_from_object('django.conf:settings', namespace='CELERY')

app.autodiscover_tasks()


app.conf.beat_schedule = {
    'fetch-movies-every-minute': {
        'task': 'Movies.tasks.movie_scrap',
        'schedule': crontab(minute='*/1'),  # Every 1 minute
    },
}
@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
