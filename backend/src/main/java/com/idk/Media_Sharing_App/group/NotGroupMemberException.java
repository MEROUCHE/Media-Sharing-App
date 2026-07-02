package com.idk.Media_Sharing_App.group;

public class NotGroupMemberException extends RuntimeException {
    public NotGroupMemberException() {
        super("You must be a group member to perform this action");
    }
}