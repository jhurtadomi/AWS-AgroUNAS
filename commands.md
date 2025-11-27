PS D:\8 CICLO\Desarrollo de Apps para la Nube\AgroUNAS\app\agromarket-api> $REGION="us-east-1"
PS D:\8 CICLO\Desarrollo de Apps para la Nube\AgroUNAS\app\agromarket-api> $REPO_NAME="agromarket-api"
PS D:\8 CICLO\Desarrollo de Apps para la Nube\AgroUNAS\app\agromarket-api> $ACCOUNT_ID = aws sts get-caller-identity --query Account --output text
PS D:\8 CICLO\Desarrollo de Apps para la Nube\AgroUNAS\app\agromarket-api> $ECR_URI = "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPO_NAME"
PS D:\8 CICLO\Desarrollo de Apps para la Nube\AgroUNAS\app\agromarket-api> aws ecr create-repository --repository-name $REPO_NAME --region $REGION
{
    "repository": {
        "repositoryArn": "arn:aws:ecr:us-east-1:600222957143:repository/agromarket-api",
        "registryId": "600222957143",
        "repositoryName": "agromarket-api",
        "repositoryUri": "600222957143.dkr.ecr.us-east-1.amazonaws.com/agromarket-api",
        "createdAt": "2025-11-27T13:53:06.831000-05:00",
        "imageTagMutability": "MUTABLE",
        "imageScanningConfiguration": {
            "scanOnPush": false
        },
        "encryptionConfiguration": {
            "encryptionType": "AES256"
        }
    }
}

PS D:\8 CICLO\Desarrollo de Apps para la Nube\AgroUNAS\app\agromarket-api> aws ecr get-login-password --region $REGION | docker login `
>>   --username AWS `
>>   --password-stdin $ECR_URI
Login Succeeded
PS D:\8 CICLO\Desarrollo de Apps para la Nube\AgroUNAS\app\agromarket-api> docker build -t agromarket-api:v1 .

