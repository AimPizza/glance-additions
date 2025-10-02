# Glance Additons

This repo contains some additions for the [Glance](https://github.com/glanceapp/glance/) dashboard.

## contents

> not a lot going on here right now

- `custom-api/` exposes endpoints to be used in the dashboard. Reason: I didn't find a way to dynamically put the current date into a URL. 

## usage

The current approach is to clone this repo to where you keep your Glance config, then add the docker-compose snippet and mount `config/`
