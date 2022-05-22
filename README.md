# ShareAMeal-Kevin

## About
This is an API that people can use to share their leftover meals with eachother. The API allows its users to retrieve information about meals being served. Users can also post their own meals to share with other users.

To use the API to it's full potential the user needs to register themselves and then login. The API then gives a API key that is needed for the more advanced requests.

API created by **Kevin van Gils**(2175525)
**Email:** kph.vangils@student.avans.nl

## The API

<details><summary><h3>User</h3></summary>
<p>

- REGISTER USER: post("/api/user")
- GET ALL USERS: get("/api/user")
- GET USERS BY ID: get("/api/user/*id*")
- GET PERSONAL PROFILE: get("/api/profile")
- UPDATE USER: put("/api/user/*id*")
- DELETE USER: delete("/api/user/*id*")

- LOGIN: post("/api/auth/login")

</p>
</details>
<details><summary><h3>Meal</h3></summary>
<p>

- REGISTER MEAL: post("/api/meal")
- GET ALL MEALS: get("/api/meal")
- GET MEALS BY ID: get("/api/meal/*id*")
- DELETE MEALS: delete("/api/meal/*id*")


</p>
</details>

## The Data
<details><summary><h3>User</h3></summary>
<p>

```
{
    "firstName": string,
    "lastName": string,
    "isActive": number,
    "emailAdress": string(validated),
    "password": string,
    "phoneNumber": string(validated),
    "roles": string('admin', 'editor', 'guest'),
    "street": string,
    "city": string
}
```

</p>
</details>

<details><summary><h3>Meal</h3></summary>
<p>

```
{
    "isActive": number,
    "isVega": number,
    "isVegan": number,
    "isToTakeHome": number,
    "dateTime": string,
    "maxAmountOfParticipants": number,
    "price": number,
    "imageUrl": string,
    "name": string,
    "description": string,
    "allergenes": string('gluten', 'lactose', 'noten')
}
```

</p>
</details>
