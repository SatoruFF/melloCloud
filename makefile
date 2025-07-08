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

clean-space:
	@echo "🔍 Cleaning up caches and temporary files..."
	sudo apt-get clean
	sudo apt-get autoremove --purge -y
	sudo journalctl --vacuum-time=2d || true
	# sudo rm -rf /var/log/*.gz /var/log/*.[0-9] /var/log/*.log || true
	npm cache clean --force || true
	# yarn cache clean || true
	# find /home/satoru -type d -name "node_modules" -prune -exec rm -rf {} \; || true
	docker system prune -a -f --volumes || true
	@echo "✅ Cleanup complete. Free disk space:"
	df -h /


# make up         # start
# make down       # stop
# make restart    # restert
# make logs       # get logs
# make clean      # clean all
# make restart-caddy  # only caddy restart
