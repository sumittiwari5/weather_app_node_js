pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "sumittiwari05/weather-canary"
        IMAGE_TAG = "v${BUILD_NUMBER}"
        SERVER_A = "172.31.65.169"
        SERVER_B = "172.31.78.11"
        NGINX = "172.31.68.160"
    }

    stages {

        // STEP 1
        stage('Clone Repo') {
            steps {
                git branch: 'main', url: 'https://github.com/sumittiwari5/weather_app_node_js.git'
            }
        }

        // STEP 2
        stage('Build Image') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE}:${IMAGE_TAG} ."
            }
        }

        // STEP 3 (secure login recommended)
        stage('Push Image') {
            steps {
                sh '''
                echo "Skipping secure creds for now (demo purpose)"
                docker login -u sumittiwari05 -p dckr_pat_Qb3tFCIlIU6iofUtcxhDM02iN1s
                docker push ${DOCKER_IMAGE}:${IMAGE_TAG}
                '''
            }
        }

        // STEP 4
        stage('Select Target') {
            steps {
                script {
                    def active
                    def target
                    def firstRun

                    if (fileExists('active_server.txt')) {
                        active = readFile('active_server.txt').trim()
                        firstRun = false
                    } else {
                        active = env.SERVER_A
                        firstRun = true
                    }

                    target = (active == env.SERVER_A) ? env.SERVER_B : env.SERVER_A

                    env.ACTIVE = active
                    env.TARGET = target
                    env.FIRST_RUN = firstRun.toString()

                    echo "ACTIVE: ${env.ACTIVE}"
                    echo "TARGET: ${env.TARGET}"
                }
            }
        }

        // INITIAL DEPLOY
        stage('Initial Deploy') {
            when { expression { env.FIRST_RUN == 'true' } }
            steps {
                script {
                    deployApp(env.ACTIVE)
                    updateNginx(env.ACTIVE, env.TARGET, 10, 0)
                    writeFile file: 'active_server.txt', text: env.ACTIVE
                }
            }
        }

        // DEPLOY NEW VERSION
        stage('Deploy Canary') {
            when { expression { env.FIRST_RUN != 'true' } }
            steps {
                script {
                    deployApp(env.TARGET)
                }
            }
        }

        // 25% TRAFFIC
        stage('Canary 25%') {
            when { expression { env.FIRST_RUN != 'true' } }
            steps {
                script {
                    updateNginx(env.ACTIVE, env.TARGET, 7, 3)
                }
            }
        }

        // WAIT
        stage('Observe 25%') {
            when { expression { env.FIRST_RUN != 'true' } }
            steps {
                sleep 60
            }
        }

        // 50% TRAFFIC
        stage('Canary 50%') {
            when { expression { env.FIRST_RUN != 'true' } }
            steps {
                script {
                    updateNginx(env.ACTIVE, env.TARGET, 5, 5)
                }
            }
        }

        // WAIT
        stage('Observe 50%') {
            when { expression { env.FIRST_RUN != 'true' } }
            steps {
                sleep 60
            }
        }

        // 100% TRAFFIC
        stage('Full Promotion') {
            when { expression { env.FIRST_RUN != 'true' } }
            steps {
                script {
                    updateNginx(env.TARGET, "", 10, 0)
                }
            }
        }

        // SAVE NEW ACTIVE
        stage('Update Active Server') {
            when { expression { env.FIRST_RUN != 'true' } }
            steps {
                script {
                    writeFile file: 'active_server.txt', text: env.TARGET
                }
            }
        }
    }
}

// ----------Helper Function -----------

def deployApp(server) {
    sshagent(['4eca6e05-7b83-48c9-8084-d1f99a76c80b']) {
        sh """
        ssh -o StrictHostKeyChecking=no ubuntu@${server} '
        docker pull ${DOCKER_IMAGE}:${IMAGE_TAG} || exit 1 &&
        docker stop app || true &&
        docker rm app || true &&
        docker run -d -p 3042:3042 -e PORT=3042 --name app ${DOCKER_IMAGE}:${IMAGE_TAG} &&
        docker image prune -f
        '
        """
    }
}

// ------Update Nginx (traffic cotrol)--------

def updateNginx(active, target, w1, w2) {
    sshagent(['4eca6e05-7b83-48c9-8084-d1f99a76c80b']) {
        if (w2 == 0) {
            // ONLY ONE SERVER
            sh """
            ssh -o StrictHostKeyChecking=no ubuntu@${NGINX} '

            sudo tee /etc/nginx/conf.d/app.conf > /dev/null <<EOF
upstream backend {
    server ${active}:3042 weight=${w1};
}

server {
    listen 80;
    server_name _;
    location / {
        proxy_pass http://backend;
    }
}
EOF

            sudo nginx -t && sudo systemctl reload nginx
            '
            """
        } else {
            // BOTH SERVERS
            sh """
            ssh -o StrictHostKeyChecking=no ubuntu@${NGINX} '

            sudo tee /etc/nginx/conf.d/app.conf > /dev/null <<EOF
upstream backend {
    server ${active}:3042 weight=${w1};
    server ${target}:3042 weight=${w2};
}

server {
    listen 80;
    server_name _;
    location / {
        proxy_pass http://backend;
    }
}
EOF

            sudo nginx -t && sudo systemctl reload nginx
            '
            """
        }
    }
}
