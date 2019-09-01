##### I have created a serverless application using express and node with mongodb.

### Created the following endpoints to accomplish the task.

## Create User
``` 
    End-point: "/user"
    Method: "POST"
    Body: {
        name,
        email,
        mobile,
        messages
    }
    Response : {
    messages,
    _id,
    name,
    email,
    mobile,
    __v
    }
```
## Get User
``` 
    End-point: "/user"
    Method: "GET",
    Response : [{
        messages,
        _id,
        name,
        email,
        mobile,
        __v
    }]
```
## Get Messages of a User
``` 
    End-point: "/messages/sent/user/:id"
    Method: "GET",
    Response : ["Hello from the lambda async"]
```
## Sending Message to Users
``` 
    End-point: "/send"
    Method: "POST"
    Body: { message }
    Response : "Sent message successfully"
```
##### The application is hosted on aws lambdas on the following base url
```https://n0j4l35246.execute-api.us-east-1.amazonaws.com/dev```