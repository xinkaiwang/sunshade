# sunshade
piz (w) based sun-shade project. This project (sunshade) is just the piz side code. Include motorService + sunshadeService + wemo simulator, etc.

# install

```
git clone https://github.com/xinkaiwang/sunshade.git
cd sunshade
vi config.js
```

# motorService
Motor service manages a DC motor (with PWM H-bridge, with hall-effect QD sensor, with my-sql based persistent storage for position).
## run motorService (cmd line)
``` js
sudo ./motorService.js
// running in port 8180
curl "http://localhost:8180/api/v1/status/get"
```

## run motorService (as service)
``` js
sudo forever-service  install --runAsUser root motorService --script ./motorService.js
sudo service motorService start
tail -f /var/log/motorService.log
```

## call motorService API
``` js
node ./demoMotorService
```

# sunshadeService
Sunshade service takes cares of buttons, LEDs, tempretures, heartbeats, etc.
## demoButton
``` js
node ./demoButtons.js
```


# license

MIT
