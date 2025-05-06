import os
from celery.schedules import crontab

from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Project.settings')

app = Celery('Project')

app.config_from_object('django.conf:settings', namespace='CELERY')

app.autodiscover_tasks()


app.conf.beat_schedule = {
    'fetch-movies-every-2-days': {
        'task': 'Movies.tasks.movie_scrap',
        'schedule': crontab(day_of_week=0, hour=0, minute=1),
    },
}
@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
