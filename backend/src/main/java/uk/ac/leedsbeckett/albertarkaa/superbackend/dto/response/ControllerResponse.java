package uk.ac.leedsbeckett.albertarkaa.superbackend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ControllerResponse<T>  {
    private boolean success;
    private String errorMessage;
    private T data;
}