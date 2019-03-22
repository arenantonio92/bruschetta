value=$(shuf -i 0-45 -n 1)
dollar='$'
classAPI='class'
sensorIdentifier='hjdjbcjakbc'
timestamp=$(date +%Y-%m-%dT%H:%M:%SZ)
measureType='TEMPERATURE'
farmingId='00000'
farming="resource:org.bn.evoo.FarmingProcess#$farmingId"
sensingId=$(pwgen -1 20)
sensorId='XCB7898765'

transaction="curl -X POST --header 'Content-Type: application/json' --header 'Accept: application/json' -d '{ 
   \"$dollar$classAPI\": \"org.bn.evoo.newFarmingProcessSensing\",  
   \"sensingId\": \"$sensingId\", 
   \"farming\": \"$farming\", 
   \"measureType\": \"$measureType\", 
   \"value\": $value, 
   \"sensorIdentifier\": \"$sensorId\", 
   \"sensingTimestamp\": \"$timestamp\" 
 }' 'http://$2:3000/api/org.bn.evoo.newFarmingProcessSensing?access_token=$1'"

echo $transaction
eval $transaction