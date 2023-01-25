#!/bin/bash

if [ "$1" == "install" ]; then 
    if [ "$2" == "macos" ]; then
        echo "Installing Homebrew... Please enter sudo password if prompted."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        brew install gcc
        brew install make
        brew install libpcap
        brew install nodejs@16
    elif [ "$2" == "linux" ]; then
        sudo apt update
        sudo apt install -y build-essential make
        sudo apt install -y libpcap-dev

        if [ ! command -v node &> /dev/null ]; then
            sudo apt install -y curl gnupg ca-certificates lsb-release
            curl -sL https://deb.nodesource.com/setup_19.x | bash -
            sudo apt-get -y install nodejs
        else
            echo "NodeJS already installed. Skipping."
        fi

        if [ ! command -v docker &> /dev/null ]; then
        
            sudo mkdir -p /etc/apt/keyrings
            curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
            echo \
                "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
                $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
            sudo apt update
            sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin
            curl https://desktop.docker.com/linux/main/amd64/docker-desktop-4.16.2-amd64.deb --output /tmp/docker-desktop.deb
            sudo apt install /tmp/docker-desktop.deb
        else
            echo "Docker already installed. Skipping."
        fi

        echo "Done installing dependencies!"
    elif [ "$2" == "" ]; then
        echo "./helper.sh install [macos/linux]"
        exit 1
    else
        echo "Unknown installation target. Valid options are: macos, linux"
        exit 1
    fi
elif [ "$1" == "build" ]; then
    echo "Building docker image..."
    docker build -t networkintelligence .    
    echo "Done building docker image."
elif [ "$1" == "run" ]; then
    echo "Running docker image..."
    docker run --name networkintelligence -p 3000:3000 networkintelligence
    echo "Image running on 127.0.0.1:3000"
elif [ "$1" == "stop" ]; then
    docker stop networkintelligence
elif [ "$1" == "restart" ]; then
    docker start networkintelligence
else
    echo "$1"
fi
