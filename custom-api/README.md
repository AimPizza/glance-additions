## contents

### mensa

-   `/mensa/12345` mensa (college cafetaria) endpoint giving you todays meals from [OpenMensa](https://openmensa.org)

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

### syncthing

-   `/syncthing/folders` endpoint for a [Syncthing](https://syncthing.net/) instance. Currently returns added devices combined with a natural language duration since this instance last connected to that device.

note: some devices will return "never" as their date in the actual Syncthing API is set to 1970 (the server itself is among those). To filter them out, add the query parameter `filterNever=true`.

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

## valuable resources used

-   https://sabe.io/tutorials/how-to-deploy-express-app-docker
-   https://expressjs.com/en/5x/api.html
-   https://docs.openmensa.org/api/v2/canteens/meals/

## developer notes

use the command below in order to load variables set in .env into your current shell:

```bash
set -a && source .env && set +a
```
