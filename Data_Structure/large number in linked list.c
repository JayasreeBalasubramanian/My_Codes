#include <stdio.h>
#include <malloc.h>

typedef struct node {
    int data;
    struct node *next;
} NODE;

NODE *makenode(int data) {
    NODE *temp = (NODE *)malloc(sizeof(NODE));
    temp->data = data;
    temp->next = NULL;
    return temp;
}

void display(NODE *l) {
    while(l) {
        printf("%5d", l->data);
        l = l->next;
    }
}
int largenumber(NODE *l)
{
    int result = 0;
    NODE *current = l;

    while (current != NULL)
    {
        result = result * 100 + current->data;
        current = current->next;
    }
     return result;
}
int main()
{
    NODE *l = NULL;
    NODE *temp;
    char num[100];
    int len, i, value;
    printf("Enter the number: ");
    scanf("%s", num);
    len = 0;
    while (num[len] != '\0')
        len++;
    i = 0;
    if (len % 2 != 0)
    {
        value = num[i] - '0';
        l = makenode(value);
        temp = l;
        i++;
    }
    else
    {
        value = (num[i] - '0') * 10 + (num[i + 1] - '0');
        l = makenode(value);
        temp = l;
        i = i + 2;
    }
    while (i < len)
    {
        value = (num[i] - '0') * 10 + (num[i + 1] - '0');
        temp->next = makenode(value);
        temp = temp->next;
        i = i + 2;
    }
    printf("Linked List: ");
    display(l);
    printf("\nNumber = %d", largenumber(l));
    return 0;
}
