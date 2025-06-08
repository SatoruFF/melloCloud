setup: 
	./setup.sh

up:
	docker-compose up -d --build

down:
	docker-compose down

restart:
	docker-compose down && docker-compose up -d --build

logs:
	docker-compose logs -f

clean:
	docker system prune -af --volumes

rebuild:
	docker-compose build --no-cache

restart-caddy:
	docker-compose restart web_server

# make up         # start
# make down       # stop
# make restart    # restert
# make logs       # get logs
# make clean      # clean all
# make restart-caddy  # only caddy restart
