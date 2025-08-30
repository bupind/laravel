# FrankenPHP and Laravel Octane with Docker

This repo is a docker boilerplate to use for Laravel projects. Containers included in this docker:

1. [Laravel 11 & 12](https://laravel.com/docs/)
2. [FrankenPHP](https://frankenphp.dev/docs/docker/)
3. MySQL
4. Redis
5. Supervisor
6. [Octane](https://laravel.com/docs/octane)
7. Minio for S3
8. MailPit

The purpose of this repo is to run [Laravel 11 & Laravel 12](https://laravel.com/docs/) in a Docker container
using [Octane](https://laravel.com/docs/octane) and [FrankenPHP](https://frankenphp.dev/docs/docker/).

## Installation

Use the package manager [git](https://git-scm.com/downloads) to install Docker boilerplate.

```bash
# setup project locally
$ git clone
# copy env
$ cp .env.example .env
# install
$ composer install
# create key
$ php artisan key:generate
# publish assets
$ php artisan crud:publish
# run crud
$ php artisan crud:install
```

## Usage

Build the Docker images:

```bash
# build docker images
$ docker compose build
```

Run the containers:

```bash
# Run containers
$ docker compose up -d
```

To stop the containers, run:

```bash
# Stop containers
$ docker compose down
```

To view the logs of a specific container, run:

```bash
# View logs
$ docker compose logs <container_name>
```

**If you are using podman replace `docker` with `podman`**

To access the application, open your browser and navigate to the URL specified in the `APP_URL` variable in your `.env`
file.
