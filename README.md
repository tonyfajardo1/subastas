# Subastas

Este proyecto es una aplicación desarrollada por Ulises Fajardo, Ronald Salgado y Andrés Herrera.

## Requisitos

- Node.js
- npm

## Instalación

1. Clona este repositorio:
    ```bash
    git clone https://github.com/tonyfajardo1/subastas
    cd subastas
    ```

2. Instala las dependencias:
    ```bash
    npm install
    ```
**Docker**
1. Descargar las imágenes desde Docker Hub
    ```bash
    docker pull tony0305/manejador
    docker pull tony0305/postores
    ```
2. Ejecutar los contenedores en local
    ```bash
    docker run -p 8080:8080 tony0305/manejador
    docker run -p 8081:8081 tony0305/postores
    ```

## Scripts disponibles

Debes correr en /subastas-frontend, /subastas-remotas/postores y /subastas-remotas/manejador

### `npm start`

Inicia la aplicación en modo de desarrollo.  
Abre [http://localhost:3000](http://localhost:3000) para verla en tu navegador.

## Estructura del proyecto

/subastas-frontend: se encuentra el front end con sus componentes 
/subastas-remotas/postores: es el servicio de los postores
/subastas-remotas/manejador: es el servicio de los manejadores

## Deber 3

Ulises Fajardo: se encargo de realizar la estructura del proyecto, el estilo del front end y correción de errores
Ronald Salgado: se encargo de la lógica de los servicios del manejador
Andrés Herrera: se encargo de corregir errores y de implementar la lógica del postor