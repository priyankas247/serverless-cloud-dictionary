import boto3

# Initialize DynamoDB table
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('CloudDictionary')

# Scan all items
response = table.scan()
items = response['Items']

while 'LastEvaluatedKey' in response:
    response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
    items.extend(response['Items'])

# Define category based on keyword match
def assign_category(item):
    content = str(item).lower()
    if 'aws' in content:
        return 'AWS'
    elif 'azure' in content:
        return 'Azure'
    elif 'gcp' in content or 'google cloud' in content:
        return 'GCP'
    else:
        return 'General'

# Update each item with appropriate category
for item in items:
    # Adjust these keys based on your primary key schema
    key = {k['AttributeName']: item[k['AttributeName']] for k in table.key_schema}

    category = assign_category(item)

    table.update_item(
        Key=key,
        UpdateExpression="SET #cat = :val",
        ExpressionAttributeNames={'#cat': 'category'},
        ExpressionAttributeValues={':val': category}
    )

print(f"Updated {len(items)} items with 'category' field based on content.")
