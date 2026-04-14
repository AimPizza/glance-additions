# Glance Additons

This repo contains some additions for the [Glance](https://github.com/glanceapp/glance/) dashboard.

## custom-api

exposes endpoints to be used in the dashboard. Reason: I didn't find a way to dynamically put the current date into a URL.

### endpoints

`/mensa/12345` mensa (college cafetaria) endpoint giving you todays meals from [OpenMensa](https://openmensa.org)

- this is the default for another route `/mensa/12345/offset/0` where the offset value is the difference in days from today. For tomorrow, you'd use `1`.

<details>
<summary>example response</summary>

```json
[
    {
        "id": 987654321,
        "name": "Like Chicken Mini Schnitzel",
        "category": "Veganes Gericht",
        "prices": {
            "students": 3.5,
            "employees": 5.95,
            "pupils": null,
            "others": 7.9
        },
        "notes": [
            "Sulfit/ Schwefeldioxid",
            "Vegan",
            "Farbstoff",
            "Antioxidationsmittel"
        ]
    }
]
```

</details>
<br>

`/syncthing/folders` endpoint for a [Syncthing](https://syncthing.net/) instance. Currently returns added devices combined with a natural language duration since this instance last connected to that device.

<details>
<summary>example response</summary>

```json
[
    {
        "name": "Smartphone Alice",
        "sinceLastSeen": "5s"
    },
    {
        "name": "Desktop Bob",
        "sinceLastSeen": "0s"
    },
    {
        "name": "Analytical Engine",
        "sinceLastSeen": "15min"
    }
]
```

</details>
<br>

`/pangolin/public-http-resources` list your public [Pangolin](https://pangolin.net/) resources. Acts as an automated dashboard for all your services

<details>
<summary>example response</summary>

```json
[
    {
        "name": "forgejo",
        "url": "https://git.example.com",
        "healthStatus": "unknown",
        "iconUrl": "https://cdn.jsdelivr.net/gh/selfhst/icons/png/forgejo.png"
    },
    {
        "name": "uptime-kuma",
        "url": "https://status.example.com",
        "healthStatus": "healthy",
        "iconUrl": "https://cdn.jsdelivr.net/gh/selfhst/icons/png/uptime-kuma.png"
    }
]
```

</details>
<br>

## usage

Use files in `config/` as inspiration on how to integrate these endpoints to your dashboard.

The [docker-compose.yml](./custom-api/docker-compose.yml) should suffice as a minimal example.

### developing

Using `yarn dev` will run this before starting the application to load env variables:

```bash
set -a && source .env && set +a
```

## valuable resources used

- Express JS
    - https://sabe.io/tutorials/how-to-deploy-express-app-docker
    - https://expressjs.com/en/5x/api.html
- APIs
    - https://docs.openmensa.org/api/v2/canteens/meals/
    - https://docs.syncthing.net/dev/rest.html
    - https://api.pangolin.net/v1/docs/
