# Frisbee Footage Tracker
Teams typically use footage from a wide range of (online) places, the intention
of this app is mainly to keep track of all the footage regardless
of where it is, as well as the ability to take some basic stats and perform
some rudimentary data analysis. It's by no means meant to be a replacement
for the more dedicated stat taking apps/websites, but hopefully provides
enough of an insight to prove useful.

**Disclaimer:** I'm not a developer by trade, just have a tiny bit
of experience building personal web apps as a hobby and so by a
professionals standard this is likely riddled with anti-patterns and errors.
I'm always happy to hear feedback though.

## Structure
Conceptually, the entire app is just built upon `sources` - just URLs pointing
to wherever your footage is housed. Then, on top of sources, you can have
`events`, these can be `games`, `trainings` or `scrimmages`. Events don't necessarily 
have direct links to sources, since some sources may contain multiple games or 
maybe one game spans across multiple sources. Another concept to be aware of
is `clips`, however these are not a type of event, they are merely specific 
timestamps on URLs that are independent of a specific point or activity but are
still useful to your team. Clips can then be stored in `playlists` - a collection
clips with a specific theme.

### Games
Games are formed from collections of points, each point relates to a specific
source and timestamp on that source.

### Trainings
Trainings are formed from a collection of 'activities', these are just
the different drills or areas you cover in your training - you can define
these pretty much however you would like. Each activity points to a timestamp
in the URL associated with the training.

### Scrimmages
Scrimmages are the same as games, but specifically for when its just scrimmages
within your own team as this changes how you may take stats.

### Playlists
Playlists are just collections of clips that have a common theme, perhaps for
scouting a team, or highlights or everytime you run a particular play.


## How to use:

### Adding a source
As sources are the building blocks of the app, you must first check if the footage
you are planning on viewing/statting/adding has been added yet. Clicking on the
**sources** tile of the homepage will take you to a list of all added sources, if
the footage hasn't been added yet, click the green + button in the bottom right
of your screen. This will prompt you for some basic info about the source and when
you have filled it in, click **Add**.

### Adding an event
Clicking on the **events** tile on the homepage will take you to a list of all
added events, clicking one of these will take you to that event's page, if
you need to add a new event, use the green + button in the bottom right corner.
After choosing your event type, you will prompted to enter some basic info about
the event, enter this and then click **Add**.

### Taking stats for a game
Once on an events page, click on the **points** tab, this will list all points that
have already been added, clicking one of these will take you to the point overview.
To add a new point, click on the + button in the bottom right. This will prompt you
for the source the point can be found on, the timestamp (this should be typed exactly 
as shown on whichever host site your using) and the offensive team. After clicking **Add**
you will be taken to a new page to start tracking. Keep filling out the info where
possible and depending on the outcome of each possession, the form will keep extending
until there is a score. As for how much detail and what to say here, it is quite subjective,
I'd just try to keep it consistent over different games/points. When there has been a score,
click **Add Point**, this will save the point and take you back to the game overview.

### Adding clips
There are two main ways you can add a clip:
- When you are taking stats for a particular point there will be a clip icon in the
bottom right, clicking on this will open a pop up where you can enter some details
about the clip. One of these details will be `playlist`, you can select an existing 
playlist or add a new one.
- If you are on a playlist (**home -> playlists -> playlist**), then you can click on
the button in the bottom right to add a new clip, where you will be prompted for 
the required info.

## Backend
The app uses supabase for its backend, an image of the schema can be found below.
![Supabase Schema](https://github.com/mharry97/frisbee-footage-tracker/blob/main/public/Schema.png?raw=true)


## To do:
- Login logic
- RLS
- Filters on clips and points page
- Training activity cards
- Make view point page better
- All clips page
- Work out best way of showing possessions on a given point (if at all)
- Edit point page
- Double check unique filter on add source
- Switch out grid and cards in source for chakra ui
- Clicking on source tile should open modal where you can edit
- Switch dashboard grid to chakra ui
- Sort out loading so none of a page loads until all data is loaded
- Fix rehydration issue
- Add stats page
- Change overview page to blanket no data instead of one for individual vids
- Private playlists/clips





