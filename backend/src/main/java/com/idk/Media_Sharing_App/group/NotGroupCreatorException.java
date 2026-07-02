package com.idk.Media_Sharing_App.group;

public class NotGroupCreatorException extends RuntimeException {
    public NotGroupCreatorException(String action) {
        super("Only the group creator can " + action);
    }
}