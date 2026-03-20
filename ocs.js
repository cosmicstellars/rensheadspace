var ocsHumanData = [
    {
        "id": "seiichi",  
        "title": "Seiichi",
        "image": "/img/ocs/seiichi/icon.png",
		"wip": false,
        
        "age": "21",
        "gender": "male",
        "pronouns": "he/him",
        "sexuality": "homosexual",
        
        "description": "no description yet",
        "backstory": "no backstory yet",
        
        "relationships": [
            {
                "category": "family",
                "chars": ["mizuki"] // placeholder for when you make her!
            },
            {
                // "category": "friends",
                // "chars": ["bob"] // this will automatically link to bob below!
            }
        ],
        
        "gallery": [
            {
                "image": "/img/ocs/seiichi/gallery/render.png",   
            },
            {
                "image": "/img/ocs/seiichi/gallery/veemodraw.png",
                "description": "drawing by veemo"
            }
        ]
    }, // <-- notice the comma here! this separates the characters.
     {
        "id": "mizuki",
        "title": "Mizuki",
        "image": "/img/ocs/mizuki/icon.png",
		"wip": true,
        
        "age": "",
        "gender": "",
        "pronouns": "",
        "sexuality": "",
        
        "description": "",
        "backstory": "",
        
        "relationships": [
            {
                "category": "family",
                "chars": ["seiichi"] // links right back to seiichi!
            }
        ],
        
        "gallery": [] // you can leave it empty if he has no art yet!
    }
];

var ocsFantasyData = [
    // your magic/fantasy characters will go in here, formatted the exact same way!
];