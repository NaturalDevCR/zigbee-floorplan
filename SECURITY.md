# Security policy

If you find a security problem, please report it privately through GitHub's **Report a vulnerability** option in the Security tab of this repository instead of opening a public issue.

Please include the version of Home Assistant and of this integration, and the steps to reproduce.

The integration reads data from MQTT, stores a plan in Home Assistant's storage and serves uploaded images to signed-in users. Areas that matter most: image upload validation, authentication of the websocket and HTTP endpoints, and handling of data coming from MQTT.
