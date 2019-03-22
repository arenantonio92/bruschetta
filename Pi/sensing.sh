#!/bin/bash
address="192.168.0.101"
if [ "$1" == "" ] || [ "$2" == "" ]
then
echo "Usage: ./sensing.sh [transmission_frequency(seconds)] [access_token]"
echo "Access token must be retrieved from http://$address:3000/explorer/  after performing athentication on http://$address:3000/auth/github/"
echo "example: ./sensing.sh 60 37kjYU5...h274qwh"
else
watch -n $1 ./createTransaction.sh $2 $address
fi